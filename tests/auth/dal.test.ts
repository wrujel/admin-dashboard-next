import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The data-access layer is the real security boundary (the proxy check is
 * optimistic and spoofable), so both the configured and demo paths are
 * covered here, plus the redirect that protects server components.
 */

const getSession = vi.fn();
const headers = vi.fn(async () => new Headers({ cookie: "session=abc" }));
const redirect = vi.fn((path: string) => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  // React's request-scoped cache needs a render context; identity keeps the
  // wrapped functions callable (and independent) under test.
  cache: <T>(fn: T) => fn,
}));

vi.mock("next/headers", () => ({ headers }));
vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/app/lib/auth/auth", () => ({ auth: { api: { getSession } } }));

const configured = vi.hoisted(() => ({ value: true }));
vi.mock("@/app/lib/auth/config", () => ({
  get authConfigured() {
    return configured.value;
  },
}));

async function loadDal() {
  vi.resetModules();
  return import("@/app/lib/auth/dal");
}

beforeEach(() => {
  vi.clearAllMocks();
  configured.value = true;
  headers.mockResolvedValue(new Headers({ cookie: "session=abc" }));
});

/* -------------------------------------------------------------------------- */

describe("getCurrentUser — demo mode", () => {
  beforeEach(() => {
    configured.value = false;
  });

  it("returns the demo admin without touching the session", async () => {
    const { getCurrentUser } = await loadDal();
    await expect(getCurrentUser()).resolves.toEqual({
      id: "demo-admin",
      name: "Demo Admin",
      email: "admin@nexus.app",
      image: null,
      role: "admin",
    });
    expect(getSession).not.toHaveBeenCalled();
  });
});

describe("getCurrentUser — configured", () => {
  it("maps the verified session user", async () => {
    getSession.mockResolvedValue({
      user: {
        id: "u1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        image: "https://cdn/ada.png",
        role: "editor",
      },
    });

    const { getCurrentUser } = await loadDal();
    await expect(getCurrentUser()).resolves.toEqual({
      id: "u1",
      name: "Ada Lovelace",
      email: "ada@example.com",
      image: "https://cdn/ada.png",
      role: "editor",
    });
  });

  it("passes the request headers to the session check", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", name: "A", email: "a@b.c", image: null },
    });

    const { getCurrentUser } = await loadDal();
    await getCurrentUser();

    expect(headers).toHaveBeenCalled();
    expect(getSession).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
  });

  it("defaults the role to admin when the session has none", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", name: "A", email: "a@b.c", image: null },
    });

    const { getCurrentUser } = await loadDal();
    await expect(getCurrentUser()).resolves.toMatchObject({ role: "admin" });
  });

  it("returns null when there is no session", async () => {
    getSession.mockResolvedValue(null);
    const { getCurrentUser } = await loadDal();
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the session carries no user", async () => {
    getSession.mockResolvedValue({ user: undefined });
    const { getCurrentUser } = await loadDal();
    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe("requireUser", () => {
  it("returns the user when authenticated", async () => {
    getSession.mockResolvedValue({
      user: { id: "u1", name: "Ada", email: "ada@example.com", image: null },
    });

    const { requireUser } = await loadDal();
    await expect(requireUser()).resolves.toMatchObject({ id: "u1" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("returns the demo user in demo mode", async () => {
    configured.value = false;
    const { requireUser } = await loadDal();
    await expect(requireUser()).resolves.toMatchObject({ id: "demo-admin" });
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects to /login when unauthenticated", async () => {
    getSession.mockResolvedValue(null);
    const { requireUser } = await loadDal();

    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledExactlyOnceWith("/login");
  });
});

describe("module surface", () => {
  it("re-exports authConfigured", async () => {
    const dal = await loadDal();
    expect(dal.authConfigured).toBe(true);
  });
});
