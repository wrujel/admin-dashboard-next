"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../lib/utils";
import { User } from "../models/user";
import { redirect } from "next/navigation";

export const createUser = async (formData: any) => {
  const { username, email, password, phone, address, isAdmin, isActive } =
    Object.fromEntries(formData);
  try {
    connectToDB();
    const newUser = new User({
      username,
      email,
      passwordHash: password,
      phone,
      address,
      isAdmin,
      isActive,
    });
    await newUser.save();
  } catch (error) {
    throw new Error("Error creating user");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};
