import { beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";

/**
 * The model modules are `mongoose.models.X || mongoose.model("X", schema)` —
 * define-once guards so Next's dev-time module reloading does not re-register
 * a compiled model. Both sides of that guard are exercised here.
 */

async function freshImport<T>(path: string): Promise<T> {
  vi.resetModules();
  return (await import(/* @vite-ignore */ path)) as T;
}

/** `defaultValue` is an internal field, not part of the public SchemaType. */
const defaultOf = (path: unknown) =>
  (path as { defaultValue?: unknown }).defaultValue;

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("User model", () => {
  it("registers a User model with the expected paths", async () => {
    const { User } =
      await freshImport<typeof import("@/app/models/user")>(
        "@/app/models/user",
      );
    expect(User.modelName).toBe("User");

    const paths = Object.keys(User.schema.paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        "username",
        "email",
        "passwordHash",
        "img",
        "phone",
        "address",
        "isAdmin",
        "isActive",
        "createdAt",
        "updatedAt",
      ]),
    );
  });

  it("requires the identity fields and defaults the optional ones", async () => {
    const { User } =
      await freshImport<typeof import("@/app/models/user")>(
        "@/app/models/user",
      );
    const { paths } = User.schema;

    expect(paths.username.isRequired).toBe(true);
    expect(paths.email.isRequired).toBe(true);
    expect(paths.passwordHash.isRequired).toBe(true);

    expect(defaultOf(paths.img)).toBe("");
    expect(defaultOf(paths.phone)).toBe("");
    expect(defaultOf(paths.address)).toBe("");
    expect(defaultOf(paths.isAdmin)).toBe(false);
    expect(defaultOf(paths.isActive)).toBe(true);
  });

  it("reuses the already-compiled model instead of redefining it", async () => {
    await freshImport("@/app/models/user");
    const model = vi.spyOn(mongoose, "model");

    const { User } =
      await freshImport<typeof import("@/app/models/user")>(
        "@/app/models/user",
      );

    expect(model).not.toHaveBeenCalled();
    expect(User).toBe(mongoose.models.User);
  });
});

describe("Product model", () => {
  it("registers a Product model with the expected paths", async () => {
    const { Product } = await freshImport<
      typeof import("@/app/models/product")
    >("@/app/models/product");
    expect(Product.modelName).toBe("Product");

    const paths = Object.keys(Product.schema.paths);
    expect(paths).toEqual(
      expect.arrayContaining([
        "name",
        "description",
        "price",
        "img",
        "color",
        "size",
        "category",
        "stock",
        "createdAt",
        "updatedAt",
      ]),
    );
  });

  it("requires name, description, price and stock", async () => {
    const { Product } = await freshImport<
      typeof import("@/app/models/product")
    >("@/app/models/product");
    const { paths } = Product.schema;

    expect(paths.name.isRequired).toBe(true);
    expect(paths.description.isRequired).toBe(true);
    expect(paths.price.isRequired).toBe(true);
    expect(paths.stock.isRequired).toBe(true);

    expect(defaultOf(paths.img)).toBe("");
    expect(defaultOf(paths.color)).toBe("");
    expect(defaultOf(paths.size)).toBe("");
    expect(defaultOf(paths.category)).toBe("");
  });

  it("rejects a non-positive price and negative stock", async () => {
    const { Product } = await freshImport<
      typeof import("@/app/models/product")
    >("@/app/models/product");

    const invalid = new Product({
      name: "Test Widget",
      description: "A widget",
      price: 0,
      stock: -1,
    });

    await expect(invalid.validate()).rejects.toMatchObject({
      errors: {
        price: expect.anything(),
        stock: expect.anything(),
      },
    });
  });

  it("accepts a valid document", async () => {
    const { Product } = await freshImport<
      typeof import("@/app/models/product")
    >("@/app/models/product");

    const valid = new Product({
      name: "Test Widget",
      description: "A widget",
      price: 19.99,
      stock: 5,
    });

    await expect(valid.validate()).resolves.toBeUndefined();
    expect(valid.img).toBe("");
    expect(valid.category).toBe("");
  });

  it("reuses the already-compiled model instead of redefining it", async () => {
    await freshImport("@/app/models/product");
    const model = vi.spyOn(mongoose, "model");

    const { Product } = await freshImport<
      typeof import("@/app/models/product")
    >("@/app/models/product");

    expect(model).not.toHaveBeenCalled();
    expect(Product).toBe(mongoose.models.Product);
  });
});
