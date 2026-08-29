import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Optimistic route protection. This is a fast first gate only — the real
 * boundary is the data-access layer — but it still has to send anonymous
 * visitors to /login and signed-in ones away from it.
 *
 * `isConfigured` is evaluated at module load, so each case re-imports.
 */

const { getSessionCookie, next, redirect } = vi.hoisted(() => ({
  getSessionCookie: vi.fn(),
  next: vi.fn(() => ({ type: "next" })),
  redirect: vi.fn((url: URL) => ({ type: "redirect", to: url.pathname })),
}));

vi.mock("next/server", () => ({ NextResponse: { next, redirect } }));
vi.mock("better-auth/cookies", () => ({ getSessionCookie }));

const KEYS = ["MONGO_URI", "BETTER_AUTH_SECRET", "AUTH_SECRET"] as const;

interface ProxyModule {
  proxy: (request: { nextUrl: URL; url: string }) => {
    type: string;
    to?: string;
  };
  config: { matcher: string[] };
}

async function loadProxy(
  env: Partial<Record<(typeof KEYS)[number], string>> = {},
): Promise<ProxyModule> {
  vi.resetModules();
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  return (await import("@/proxy.js")) as unknown as ProxyModule;
}

const CONFIGURED = {
  MONGO_URI: "mongodb://localhost/nexus",
  BETTER_AUTH_SECRET: "a-very-long-and-random-secret-value",
};

const request = (pathname: string) => ({
  nextUrl: new URL(`https://nexus.app${pathname}`),
  url: `https://nexus.app${pathname}`,
});

beforeEach(() => {
  vi.clearAllMocks();
  next.mockReturnValue({ type: "next" });
  redirect.mockImplementation((url: URL) => ({
    type: "redirect",
    to: url.pathname,
  }));
});

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

/* -------------------------------------------------------------------------- */

describe("proxy — demo mode (auth not configured)", () => {
  it.each([
    "/dashboard",
    "/dashboard/users",
    "/dashboard/analytics/revenue",
    "/login",
  ])("lets %s through untouched", async (pathname) => {
    const { proxy } = await loadProxy();

    expect(proxy(request(pathname))).toEqual({ type: "next" });
    expect(getSessionCookie).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("stays open with a database but no secret", async () => {
    const { proxy } = await loadProxy({ MONGO_URI: "mongodb://localhost" });
    expect(proxy(request("/dashboard"))).toEqual({ type: "next" });
  });

  it("stays open with a secret but no database", async () => {
    const { proxy } = await loadProxy({ BETTER_AUTH_SECRET: "secret" });
    expect(proxy(request("/dashboard"))).toEqual({ type: "next" });
  });
});

describe("proxy — configured, anonymous visitor", () => {
  beforeEach(() => {
    getSessionCookie.mockReturnValue(null);
  });

  it.each(["/dashboard", "/dashboard/users", "/dashboard/products/abc"])(
    "redirects %s to /login",
    async (pathname) => {
      const { proxy } = await loadProxy(CONFIGURED);

      expect(proxy(request(pathname))).toEqual({
        type: "redirect",
        to: "/login",
      });
    },
  );

  it("leaves /login reachable", async () => {
    const { proxy } = await loadProxy(CONFIGURED);
    expect(proxy(request("/login"))).toEqual({ type: "next" });
  });

  it("builds the redirect against the request origin", async () => {
    const { proxy } = await loadProxy(CONFIGURED);
    proxy(request("/dashboard"));

    const [url] = redirect.mock.calls[0];
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toBe("https://nexus.app/login");
  });
});

describe("proxy — configured, signed-in visitor", () => {
  beforeEach(() => {
    getSessionCookie.mockReturnValue("session-token");
  });

  it.each(["/dashboard", "/dashboard/settings"])(
    "lets %s through",
    async (pathname) => {
      const { proxy } = await loadProxy(CONFIGURED);
      expect(proxy(request(pathname))).toEqual({ type: "next" });
    },
  );

  it("bounces /login back to the dashboard", async () => {
    const { proxy } = await loadProxy(CONFIGURED);

    expect(proxy(request("/login"))).toEqual({
      type: "redirect",
      to: "/dashboard",
    });
  });

  it("reads the session from the request", async () => {
    const { proxy } = await loadProxy(CONFIGURED);
    const req = request("/dashboard");
    proxy(req);
    expect(getSessionCookie).toHaveBeenCalledWith(req);
  });

  it("accepts AUTH_SECRET as the configured secret", async () => {
    const { proxy } = await loadProxy({
      MONGO_URI: "mongodb://localhost/nexus",
      AUTH_SECRET: "a-very-long-and-random-secret-value",
    });
    expect(proxy(request("/login"))).toEqual({
      type: "redirect",
      to: "/dashboard",
    });
  });
});

describe("proxy — unmatched paths", () => {
  it("passes through anything outside the matcher", async () => {
    getSessionCookie.mockReturnValue(null);
    const { proxy } = await loadProxy(CONFIGURED);

    expect(proxy(request("/api/health"))).toEqual({ type: "next" });
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("matcher config", () => {
  it("covers the dashboard subtree and the login page", async () => {
    const { config } = await loadProxy();
    expect(config.matcher).toEqual(["/dashboard/:path*", "/login"]);
  });
});
