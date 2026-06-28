"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

import { connectToDB } from "../lib/utils";
import { User } from "../models/user";
import { requireUser } from "../lib/auth/dal";
import type { ActionState } from "./action-state";

const hasDb = () => Boolean(process.env.MONGO_URI);

function parse(formData: FormData) {
  return {
    username: String(formData.get("username") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    isAdmin: formData.get("isAdmin") === "true",
    isActive: formData.get("isActive") !== "false",
  };
}

function validate(p: ReturnType<typeof parse>, requirePassword: boolean) {
  if (p.username.length < 3) return "Username must be at least 3 characters.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email))
    return "Enter a valid email address.";
  if (requirePassword && p.password.length < 6)
    return "Password must be at least 6 characters.";
  return null;
}

export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const data = parse(formData);
  const error = validate(data, true);
  if (error) return { status: "error", message: error };

  if (!hasDb())
    return {
      status: "success",
      message: "Invited in demo mode — connect a database to persist.",
    };

  try {
    await connectToDB();
    const passwordHash = await bcrypt.hash(data.password, 10);
    await User.create({
      username: data.username,
      email: data.email,
      passwordHash,
      phone: data.phone,
      address: data.address,
      isAdmin: data.isAdmin,
      isActive: data.isActive,
    });
  } catch {
    return { status: "error", message: "Could not create user." };
  }
  revalidatePath("/dashboard/users");
  return { status: "success", message: "User created." };
}

export async function updateUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  const data = parse(formData);
  const error = validate(data, false);
  if (error) return { status: "error", message: error };

  if (!hasDb()) return { status: "success", message: "Updated in demo mode." };

  try {
    await connectToDB();
    const update: Record<string, unknown> = {
      username: data.username,
      email: data.email,
      phone: data.phone,
      address: data.address,
      isAdmin: data.isAdmin,
      isActive: data.isActive,
    };
    if (data.password)
      update.passwordHash = await bcrypt.hash(data.password, 10);
    await User.findByIdAndUpdate(id, update);
  } catch {
    return { status: "error", message: "Could not update user." };
  }
  revalidatePath("/dashboard/users");
  return { status: "success", message: "User updated." };
}

export async function deleteUser(id: string): Promise<ActionState> {
  await requireUser();
  if (!hasDb()) return { status: "success", message: "Removed (demo mode)." };
  try {
    await connectToDB();
    await User.findByIdAndDelete(id);
  } catch {
    return { status: "error", message: "Could not delete user." };
  }
  revalidatePath("/dashboard/users");
  return { status: "success", message: "User deleted." };
}
