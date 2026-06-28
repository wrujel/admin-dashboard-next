import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Auth is only enforced when a database + secret are configured. Otherwise the
// app runs in demo mode (open) so the dashboard stays explorable.
const isConfigured = Boolean(
  process.env.MONGO_URI &&
  (process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET),
);

/**
 * Optimistic route protection. This is a fast first gate only — the real
 * security boundary lives in the data-access layer (app/lib/auth/dal.ts),
 * because middleware/proxy checks are spoofable (CVE-2025-29927).
 */
export function proxy(request) {
  if (!isConfigured) return NextResponse.next();

  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  if (pathname.startsWith("/dashboard") && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (pathname === "/login" && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
