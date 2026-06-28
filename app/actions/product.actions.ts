"use server";

import { revalidatePath } from "next/cache";

import { connectToDB } from "../lib/utils";
import { Product } from "../models/product";
import { requireUser } from "../lib/auth/dal";
import type { ActionState } from "./action-state";

const hasDb = () => Boolean(process.env.MONGO_URI);

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    price: Number(formData.get("price")),
    stock: Number(formData.get("stock")),
    color: String(formData.get("color") ?? "").trim(),
    size: String(formData.get("size") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
  };
}

function validate(p: ReturnType<typeof parse>): string | null {
  if (p.name.length < 3) return "Name must be at least 3 characters.";
  if (!Number.isFinite(p.price) || p.price <= 0) return "Enter a valid price.";
  if (!Number.isFinite(p.stock) || p.stock < 0)
    return "Enter a valid stock quantity.";
  return null;
}

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const data = parse(formData);
  const error = validate(data);
  if (error) return { status: "error", message: error };

  if (!hasDb())
    return {
      status: "success",
      message: "Saved in demo mode — connect a database to persist.",
    };

  try {
    await connectToDB();
    await Product.create(data);
  } catch {
    return { status: "error", message: "Could not create product." };
  }
  revalidatePath("/dashboard/products");
  return { status: "success", message: "Product created." };
}

export async function updateProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const data = parse(formData);
  const error = validate(data);
  if (error) return { status: "error", message: error };

  if (!hasDb()) return { status: "success", message: "Updated in demo mode." };

  try {
    await connectToDB();
    await Product.findByIdAndUpdate(id, data);
  } catch {
    return { status: "error", message: "Could not update product." };
  }
  revalidatePath("/dashboard/products");
  return { status: "success", message: "Product updated." };
}

export async function deleteProduct(id: string): Promise<ActionState> {
  await requireUser();
  if (!hasDb()) return { status: "success", message: "Removed (demo mode)." };
  try {
    await connectToDB();
    await Product.findByIdAndDelete(id);
  } catch {
    return { status: "error", message: "Could not delete product." };
  }
  revalidatePath("/dashboard/products");
  return { status: "success", message: "Product deleted." };
}
