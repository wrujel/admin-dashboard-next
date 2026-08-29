import { beforeEach, describe, expect, it, vi } from "vitest";

const signIn = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();
const useSession = vi.fn();

const createAuthClient = vi.fn(() => ({
  signIn,
  signUp,
  signOut,
  useSession,
  extra: "ignored",
}));

vi.mock("better-auth/react", () => ({ createAuthClient }));

beforeEach(() => {
  vi.clearAllMocks();
});

async function loadClient() {
  vi.resetModules();
  return import("@/app/lib/auth/client");
}

describe("auth client", () => {
  it("creates a single client with the default (same-origin) config", async () => {
    await loadClient();
    expect(createAuthClient).toHaveBeenCalledExactlyOnceWith();
  });

  it("exposes the client itself", async () => {
    const { authClient } = await loadClient();
    expect(authClient.signIn).toBe(signIn);
  });

  it("re-exports the credential and session helpers", async () => {
    const client = await loadClient();
    expect(client.signIn).toBe(signIn);
    expect(client.signUp).toBe(signUp);
    expect(client.signOut).toBe(signOut);
    expect(client.useSession).toBe(useSession);
  });
});
