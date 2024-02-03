"use server";

import { signIn, signOut } from "../../auth";

export const authenticate = async (formData: any) => {
  const { username, password } = Object.fromEntries(formData);
  await signIn("credentials", { username, password });
};

export const logout = async () => {
  await signOut();
};
