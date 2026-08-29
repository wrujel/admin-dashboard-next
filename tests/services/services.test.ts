import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Both services read their page size from the environment once, at module
 * load, so each case resets the registry and re-imports with the env it needs.
 */

const connectToDB = vi.fn();

const userQuery = { limit: vi.fn(), skip: vi.fn() };
const productQuery = { limit: vi.fn(), skip: vi.fn() };

/** The Mongo filters the services build from the search term. */
interface UserFilter {
  username: { $regex: RegExp };
}
interface ProductFilter {
  name: { $regex: RegExp };
}

const User = {
  countDocuments: vi.fn(),
  // Typed so the recorded call arguments can be asserted on below.
  find: vi.fn((_filter: UserFilter) => userQuery),
  findById: vi.fn(),
};
const Product = {
  countDocuments: vi.fn(),
  find: vi.fn((_filter: ProductFilter) => productQuery),
  findById: vi.fn(),
};

vi.mock("@/app/lib/utils", () => ({ connectToDB }));
vi.mock("@/app/models/user", () => ({ User }));
vi.mock("@/app/models/product", () => ({ Product }));

beforeEach(() => {
  vi.clearAllMocks();
  userQuery.limit.mockReturnValue(userQuery);
  userQuery.skip.mockResolvedValue([{ username: "ada" }]);
  productQuery.limit.mockReturnValue(productQuery);
  productQuery.skip.mockResolvedValue([{ name: "Widget" }]);
  User.countDocuments.mockResolvedValue(23);
  Product.countDocuments.mockResolvedValue(23);
  User.find.mockReturnValue(userQuery);
  Product.find.mockReturnValue(productQuery);
});

afterEach(() => {
  delete process.env.USERS_PER_PAGE;
  delete process.env.PRODUCTS_PER_PAGE;
});

async function loadUsersService(perPage?: string) {
  vi.resetModules();
  if (perPage === undefined) delete process.env.USERS_PER_PAGE;
  else process.env.USERS_PER_PAGE = perPage;
  return import("@/app/services/users.service");
}

async function loadProductsService(perPage?: string) {
  vi.resetModules();
  if (perPage === undefined) delete process.env.PRODUCTS_PER_PAGE;
  else process.env.PRODUCTS_PER_PAGE = perPage;
  return import("@/app/services/products.service");
}

/* -------------------------------------------------------------------------- */

describe("getUsers", () => {
  it("searches usernames case-insensitively", async () => {
    const { getUsers } = await loadUsersService("5");
    await getUsers("Ada", 1);

    const [filter] = User.find.mock.calls[0];
    expect(filter.username.$regex).toBeInstanceOf(RegExp);
    expect(filter.username.$regex.flags).toContain("i");
    expect(filter.username.$regex.source).toBe("Ada");
    expect(User.countDocuments).toHaveBeenCalledWith(filter);
  });

  it("pages results using the configured page size", async () => {
    const { getUsers } = await loadUsersService("5");
    await getUsers("", 3);

    expect(userQuery.limit).toHaveBeenCalledWith(5);
    expect(userQuery.skip).toHaveBeenCalledWith(10);
  });

  it("starts page 1 at offset 0", async () => {
    const { getUsers } = await loadUsersService("5");
    await getUsers("", 1);
    expect(userQuery.skip).toHaveBeenCalledWith(0);
  });

  it("falls back to 10 per page when unconfigured", async () => {
    const { getUsers } = await loadUsersService(undefined);
    await getUsers("", 2);

    expect(userQuery.limit).toHaveBeenCalledWith(10);
    expect(userQuery.skip).toHaveBeenCalledWith(10);
  });

  it("returns the rows and a rounded-up page count", async () => {
    const { getUsers } = await loadUsersService("5");
    User.countDocuments.mockResolvedValue(23);

    const result = await getUsers("", 1);

    expect(result.totalPages).toBe(5);
    expect(result.users).toEqual([{ username: "ada" }]);
  });

  it("reports zero pages for no matches", async () => {
    const { getUsers } = await loadUsersService("5");
    User.countDocuments.mockResolvedValue(0);
    userQuery.skip.mockResolvedValue([]);

    const result = await getUsers("nobody", 1);

    expect(result.totalPages).toBe(0);
    expect(result.users).toEqual([]);
  });

  it("opens a connection before querying", async () => {
    const { getUsers } = await loadUsersService("5");
    await getUsers("", 1);
    expect(connectToDB).toHaveBeenCalled();
  });

  it("wraps a query failure in a generic error", async () => {
    const { getUsers } = await loadUsersService("5");
    User.countDocuments.mockRejectedValue(new Error("connection reset"));
    await expect(getUsers("", 1)).rejects.toThrow("Error getting users");
  });
});

describe("getUser", () => {
  it("looks the user up by id", async () => {
    const { getUser } = await loadUsersService("5");
    User.findById.mockResolvedValue({ _id: "u1", username: "ada" });

    await expect(getUser("u1")).resolves.toEqual({
      _id: "u1",
      username: "ada",
    });
    expect(User.findById).toHaveBeenCalledWith("u1");
    expect(connectToDB).toHaveBeenCalled();
  });

  it("passes a missing user straight through as null", async () => {
    const { getUser } = await loadUsersService("5");
    User.findById.mockResolvedValue(null);
    await expect(getUser("nope")).resolves.toBeNull();
  });

  it("wraps a lookup failure in a generic error", async () => {
    const { getUser } = await loadUsersService("5");
    User.findById.mockRejectedValue(new Error("bad ObjectId"));
    await expect(getUser("???")).rejects.toThrow("Error getting user");
  });
});

/* -------------------------------------------------------------------------- */

describe("getProducts", () => {
  it("searches names case-insensitively", async () => {
    const { getProducts } = await loadProductsService("5");
    await getProducts("widget", 1);

    const [filter] = Product.find.mock.calls[0];
    expect(filter.name.$regex).toBeInstanceOf(RegExp);
    expect(filter.name.$regex.flags).toContain("i");
    expect(Product.countDocuments).toHaveBeenCalledWith(filter);
  });

  it("pages results using the configured page size", async () => {
    const { getProducts } = await loadProductsService("5");
    await getProducts("", 4);

    expect(productQuery.limit).toHaveBeenCalledWith(5);
    expect(productQuery.skip).toHaveBeenCalledWith(15);
  });

  it("falls back to 10 per page when unconfigured", async () => {
    const { getProducts } = await loadProductsService(undefined);
    await getProducts("", 2);

    expect(productQuery.limit).toHaveBeenCalledWith(10);
    expect(productQuery.skip).toHaveBeenCalledWith(10);
  });

  it("returns the rows and a rounded-up page count", async () => {
    const { getProducts } = await loadProductsService("5");
    Product.countDocuments.mockResolvedValue(11);

    const result = await getProducts("", 1);

    expect(result.totalPages).toBe(3);
    expect(result.products).toEqual([{ name: "Widget" }]);
  });

  it("opens a connection before querying", async () => {
    const { getProducts } = await loadProductsService("5");
    await getProducts("", 1);
    expect(connectToDB).toHaveBeenCalled();
  });

  it("wraps a query failure in a generic error", async () => {
    const { getProducts } = await loadProductsService("5");
    Product.countDocuments.mockRejectedValue(new Error("connection reset"));
    await expect(getProducts("", 1)).rejects.toThrow("Error getting users");
  });
});

describe("getProduct", () => {
  it("looks the product up by id", async () => {
    const { getProduct } = await loadProductsService("5");
    Product.findById.mockResolvedValue({ _id: "p1", name: "Widget" });

    await expect(getProduct("p1")).resolves.toEqual({
      _id: "p1",
      name: "Widget",
    });
    expect(Product.findById).toHaveBeenCalledWith("p1");
  });

  it("passes a missing product straight through as null", async () => {
    const { getProduct } = await loadProductsService("5");
    Product.findById.mockResolvedValue(null);
    await expect(getProduct("nope")).resolves.toBeNull();
  });

  it("wraps a lookup failure in a generic error", async () => {
    const { getProduct } = await loadProductsService("5");
    Product.findById.mockRejectedValue(new Error("bad ObjectId"));
    await expect(getProduct("???")).rejects.toThrow("Error getting product");
  });
});
