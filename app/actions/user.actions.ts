"use server";

import { revalidatePath } from "next/cache";
import { connectToDB } from "../lib/utils";
import { User } from "../models/user";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";

export const createUser = async (formData: any) => {
  const { username, email, password, phone, address, isAdmin, isActive } =
    Object.fromEntries(formData);
  try {
    connectToDB();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      username,
      email,
      passwordHash: hashedPassword,
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

export const deleteUser = async (formData: any) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await User.findByIdAndDelete(id);
  } catch (error) {
    throw new Error("Error deleting user");
  }

  revalidatePath("/dashboard/users");
};
