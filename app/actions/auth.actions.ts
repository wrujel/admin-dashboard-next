"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/app/lib/auth/auth";

/** Server-side sign out used by the sidebar/user-menu form. */
export const logout = async () => {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch {
    // No active session (e.g. demo mode) — fall through to redirect.
  }
  redirect("/login");
};
