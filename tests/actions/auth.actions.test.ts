import { beforeEach, describe, expect, it, vi } from "vitest";

import { logout } from "@/app/actions/auth.actions";

// Hoisted: vi.mock factories are lifted above module-level consts, and this
// file imports the action module statically.
const { signOut, headers, redirect } = vi.hoisted(() => ({
  signOut: vi.fn(),
  headers: vi.fn(),
  redirect: vi.fn((path: string) => {
    // Mirrors Next's control-flow-by-throw redirect.
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("next/headers", () => ({ headers }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/app/lib/auth/auth", () => ({ auth: { api: { signOut } } }));

beforeEach(() => {
  vi.clearAllMocks();
  headers.mockResolvedValue(new Headers({ cookie: "session=abc" }));
  redirect.mockImplementation((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  });
});

describe("logout", () => {
  it("signs the session out with the request headers", async () => {
    signOut.mockResolvedValue(undefined);

    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login");

    expect(headers).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalledExactlyOnceWith({
      headers: expect.any(Headers),
    });
  });

  it("redirects to /login after a successful sign out", async () => {
    signOut.mockResolvedValue(undefined);
    await expect(logout()).rejects.toThrow();
    expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
  });

  it("still redirects when there is no active session", async () => {
    signOut.mockRejectedValue(new Error("no session to sign out"));

    await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
  });

  it("swallows the sign-out failure rather than surfacing it", async () => {
    signOut.mockRejectedValue(new Error("better-auth exploded"));
    await expect(logout()).rejects.not.toThrow(/better-auth exploded/);
  });
});
