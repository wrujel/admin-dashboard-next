import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/app/actions/product.actions";
import { initialActionState } from "@/app/actions/action-state";

// Hoisted: vi.mock factories are lifted above module-level consts, and this
// file imports the action module statically.
const { revalidatePath, connectToDB, requireUser, Product } = vi.hoisted(
  () => ({
    revalidatePath: vi.fn(),
    connectToDB: vi.fn(),
    requireUser: vi.fn(),
    Product: {
      create: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    },
  }),
);

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/app/lib/utils", () => ({ connectToDB }));
vi.mock("@/app/models/product", () => ({ Product }));
vi.mock("@/app/lib/auth/dal", () => ({ requireUser }));

/** Builds a FormData with valid defaults, overridable per field. */
function form(over: Record<string, string> = {}) {
  const data = new FormData();
  const fields = {
    name: "Aurora Phone X",
    description: "A very nice phone.",
    price: "999",
    stock: "12",
    color: "Graphite",
    size: "One size",
    category: "Phones",
    ...over,
  };
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const VALID = {
  name: "Aurora Phone X",
  description: "A very nice phone.",
  price: 999,
  stock: 12,
  color: "Graphite",
  size: "One size",
  category: "Phones",
};

beforeEach(() => {
  vi.clearAllMocks();
  requireUser.mockResolvedValue({ id: "admin", role: "admin" });
});

afterEach(() => {
  delete process.env.MONGO_URI;
});

const withDb = () => {
  process.env.MONGO_URI = "mongodb://localhost/nexus";
};

/* -------------------------------------------------------------------------- */

describe("createProduct — authorisation", () => {
  it("requires a signed-in user before doing anything", async () => {
    await createProduct(initialActionState, form());
    expect(requireUser).toHaveBeenCalled();
  });

  it("does not write when the session check rejects", async () => {
    withDb();
    requireUser.mockRejectedValue(new Error("NEXT_REDIRECT:/login"));
    await expect(createProduct(initialActionState, form())).rejects.toThrow();
    expect(Product.create).not.toHaveBeenCalled();
  });
});

describe("createProduct — validation", () => {
  it("rejects a name shorter than three characters", async () => {
    const result = await createProduct(
      initialActionState,
      form({ name: "ab" }),
    );
    expect(result).toEqual({
      status: "error",
      message: "Name must be at least 3 characters.",
    });
  });

  it("trims whitespace before measuring the name", async () => {
    const result = await createProduct(
      initialActionState,
      form({ name: "  a  " }),
    );
    expect(result.status).toBe("error");
  });

  it.each(["0", "-5", "", "not-a-number", "Infinity"])(
    "rejects the invalid price %j",
    async (price) => {
      const result = await createProduct(initialActionState, form({ price }));
      expect(result).toEqual({
        status: "error",
        message: "Enter a valid price.",
      });
    },
  );

  it("accepts a fractional price", async () => {
    withDb();
    await createProduct(initialActionState, form({ price: "19.99" }));
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({ price: 19.99 }),
    );
  });

  it.each(["-1", "not-a-number", "-Infinity"])(
    "rejects the invalid stock %j",
    async (stock) => {
      const result = await createProduct(initialActionState, form({ stock }));
      expect(result).toEqual({
        status: "error",
        message: "Enter a valid stock quantity.",
      });
    },
  );

  it("accepts zero stock", async () => {
    withDb();
    await createProduct(initialActionState, form({ stock: "0" }));
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 0 }),
    );
  });

  it("treats an empty stock field as zero", async () => {
    withDb();
    await createProduct(initialActionState, form({ stock: "" }));
    expect(Product.create).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 0 }),
    );
  });

  it("treats missing fields as empty rather than throwing", async () => {
    const result = await createProduct(initialActionState, new FormData());
    expect(result).toEqual({
      status: "error",
      message: "Name must be at least 3 characters.",
    });
  });
});

describe("createProduct — demo mode", () => {
  it("reports success without touching the database", async () => {
    const result = await createProduct(initialActionState, form());
    expect(result).toEqual({
      status: "success",
      message: "Saved in demo mode — connect a database to persist.",
    });
    expect(Product.create).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

describe("createProduct — persisted", () => {
  beforeEach(withDb);

  it("stores the parsed fields and revalidates", async () => {
    const result = await createProduct(initialActionState, form());

    expect(connectToDB).toHaveBeenCalled();
    expect(Product.create).toHaveBeenCalledWith(VALID);
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/products");
    expect(result).toEqual({ status: "success", message: "Product created." });
  });

  it("reports a generic error when the write fails", async () => {
    Product.create.mockRejectedValue(new Error("E11000 duplicate key"));
    const result = await createProduct(initialActionState, form());

    expect(result).toEqual({
      status: "error",
      message: "Could not create product.",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */

describe("updateProduct", () => {
  it("requires a signed-in user", async () => {
    await updateProduct(initialActionState, form({ id: "p1" }));
    expect(requireUser).toHaveBeenCalled();
  });

  it("applies the same validation as create", async () => {
    await expect(
      updateProduct(initialActionState, form({ name: "x" })),
    ).resolves.toMatchObject({ status: "error" });
    await expect(
      updateProduct(initialActionState, form({ price: "0" })),
    ).resolves.toMatchObject({ status: "error" });
    await expect(
      updateProduct(initialActionState, form({ stock: "-2" })),
    ).resolves.toMatchObject({ status: "error" });
  });

  it("reports demo mode without touching the database", async () => {
    const result = await updateProduct(initialActionState, form({ id: "p1" }));
    expect(result).toEqual({
      status: "success",
      message: "Updated in demo mode.",
    });
    expect(Product.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  describe("persisted", () => {
    beforeEach(withDb);

    it("updates by id with the parsed fields", async () => {
      const result = await updateProduct(
        initialActionState,
        form({ id: "p1" }),
      );

      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith("p1", VALID);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/products");
      expect(result).toEqual({
        status: "success",
        message: "Product updated.",
      });
    });

    it("defaults a missing id to an empty string rather than throwing", async () => {
      await updateProduct(initialActionState, form());
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        "",
        expect.any(Object),
      );
    });

    it("reports a generic error when the write fails", async () => {
      Product.findByIdAndUpdate.mockRejectedValue(new Error("write conflict"));
      const result = await updateProduct(
        initialActionState,
        form({ id: "p1" }),
      );
      expect(result).toEqual({
        status: "error",
        message: "Could not update product.",
      });
    });
  });
});

/* -------------------------------------------------------------------------- */

describe("deleteProduct", () => {
  it("requires a signed-in user", async () => {
    await deleteProduct("p1");
    expect(requireUser).toHaveBeenCalled();
  });

  it("reports demo mode without touching the database", async () => {
    const result = await deleteProduct("p1");
    expect(result).toEqual({
      status: "success",
      message: "Removed (demo mode).",
    });
    expect(Product.findByIdAndDelete).not.toHaveBeenCalled();
  });

  describe("persisted", () => {
    beforeEach(withDb);

    it("deletes the document and revalidates", async () => {
      const result = await deleteProduct("p1");
      expect(connectToDB).toHaveBeenCalled();
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith("p1");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/products");
      expect(result).toEqual({
        status: "success",
        message: "Product deleted.",
      });
    });

    it("reports a generic error when the delete fails", async () => {
      Product.findByIdAndDelete.mockRejectedValue(new Error("not found"));
      const result = await deleteProduct("p1");
      expect(result).toEqual({
        status: "error",
        message: "Could not delete product.",
      });
      expect(revalidatePath).not.toHaveBeenCalled();
    });
  });
});
