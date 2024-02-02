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

export const deleteProduct = async (formData: any) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await Product.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting product");
  }

  revalidatePath("/dashboard/products");
};

export const updateProduct = async (formData: any) => {
  const { id, name, description, price, color, size, stock } =
    Object.fromEntries(formData);

  try {
    connectToDB();
    await Product.findByIdAndUpdate(id, {
      name,
      description,
      price,
      color,
      size,
      stock,
    });
  } catch (error) {
    throw new Error("Error updating product");
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
};
