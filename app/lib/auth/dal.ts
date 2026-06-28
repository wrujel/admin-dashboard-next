import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "./auth";
import { authConfigured } from "./config";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: string;
}

const DEMO_USER: SessionUser = {
  id: "demo-admin",
  name: "Demo Admin",
  email: "admin@nexus.app",
  image: null,
  role: "admin",
};

/**
 * Resolves the current user from the verified session.
 *
 * This is the security boundary — enforced here in the data-access layer
 * (server components / actions), NOT only in the proxy/middleware, which is
 * spoofable (CVE-2025-29927). When auth isn't configured we return a demo
 * user so the dashboard remains explorable.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!authConfigured) return DEMO_USER;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as { role?: string }).role ?? "admin",
  };
});

/** Use in any protected server component/action. Redirects if unauthenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export { authConfigured };
