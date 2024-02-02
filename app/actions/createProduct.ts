"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../lib/utils";
import { redirect } from "next/navigation";
import { Product } from "../models/product";

export const createProduct = async (formData: any) => {
  const { name, description, price, color, size, stock } =
    Object.fromEntries(formData);
  try {
    connectToDB();
    const newProduct = new Product({
      name,
      description,
      price,
      color,
      size,
      stock,
    });
    await newProduct.save();
  } catch (error) {
    throw new Error("Error creating product");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
};
