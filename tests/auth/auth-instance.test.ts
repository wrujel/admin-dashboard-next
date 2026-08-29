import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `auth.ts` wires Better Auth at module load: it picks an adapter from the
 * configuration and resolves the signing secret. Both are covered by
 * re-importing the module against different environments.
 */

const betterAuth = vi.fn((options: unknown) => ({ options }));
const mongodbAdapter = vi.fn(() => ({ kind: "mongodb" }));
const memoryAdapter = vi.fn(() => ({ kind: "memory" }));
const nextCookies = vi.fn(() => ({ id: "next-cookies" }));
const db = vi.fn(() => ({ name: "nexus" }));
const MongoClient = vi.fn(function (this: unknown) {
  return { db };
});

vi.mock("better-auth", () => ({ betterAuth }));
vi.mock("better-auth/adapters/mongodb", () => ({ mongodbAdapter }));
vi.mock("better-auth/adapters/memory", () => ({ memoryAdapter }));
vi.mock("better-auth/next-js", () => ({ nextCookies }));
vi.mock("mongodb", () => ({ MongoClient }));

const KEYS = ["MONGO_URI", "BETTER_AUTH_SECRET", "AUTH_SECRET"] as const;

async function loadAuth(env: Partial<Record<(typeof KEYS)[number], string>>) {
  vi.resetModules();
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  await import("@/app/lib/auth/auth");
  return betterAuth.mock.calls.at(-1)![0] as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

/* -------------------------------------------------------------------------- */

describe("database adapter", () => {
  it("uses the MongoDB adapter when auth is fully configured", async () => {
    const options = await loadAuth({
      MONGO_URI: "mongodb://localhost/nexus",
      BETTER_AUTH_SECRET: "a-very-long-and-random-secret-value",
    });

    expect(MongoClient).toHaveBeenCalledWith("mongodb://localhost/nexus");
    expect(mongodbAdapter).toHaveBeenCalled();
    expect(memoryAdapter).not.toHaveBeenCalled();
    expect(options.database).toEqual({ kind: "mongodb" });
  });

  it("falls back to the in-memory adapter with no database", async () => {
    const options = await loadAuth({ BETTER_AUTH_SECRET: "secret" });

    expect(memoryAdapter).toHaveBeenCalledWith({});
    expect(mongodbAdapter).not.toHaveBeenCalled();
    expect(options.database).toEqual({ kind: "memory" });
  });

  it("falls back to the in-memory adapter with a database but no secret", async () => {
    const options = await loadAuth({ MONGO_URI: "mongodb://localhost/nexus" });

    expect(memoryAdapter).toHaveBeenCalled();
    expect(mongodbAdapter).not.toHaveBeenCalled();
    expect(options.database).toEqual({ kind: "memory" });
  });
});

describe("signing secret", () => {
  it("prefers BETTER_AUTH_SECRET", async () => {
    const options = await loadAuth({
      MONGO_URI: "mongodb://localhost/nexus",
      BETTER_AUTH_SECRET: "better-secret",
      AUTH_SECRET: "other-secret",
    });
    expect(options.secret).toBe("better-secret");
  });

  it("falls back to AUTH_SECRET", async () => {
    const options = await loadAuth({
      MONGO_URI: "mongodb://localhost/nexus",
      AUTH_SECRET: "other-secret",
    });
    expect(options.secret).toBe("other-secret");
  });

  it("falls back to a clearly-labelled development secret", async () => {
    const options = await loadAuth({});
    expect(options.secret).toBe(
      "dev-insecure-secret-please-set-BETTER_AUTH_SECRET",
    );
  });
});

describe("hardening options", () => {
  it("requires an 8-character password and auto-signs in", async () => {
    const options = await loadAuth({ BETTER_AUTH_SECRET: "secret" });
    expect(options.emailAndPassword).toEqual({
      enabled: true,
      minPasswordLength: 8,
      autoSignIn: true,
    });
  });

  it("expires sessions after a week and refreshes them daily", async () => {
    const options = await loadAuth({ BETTER_AUTH_SECRET: "secret" });
    expect(options.session).toEqual({
      expiresIn: 604_800,
      updateAge: 86_400,
      cookieCache: { enabled: true, maxAge: 300 },
    });
  });

  it("rate-limits credential attempts", async () => {
    const options = await loadAuth({ BETTER_AUTH_SECRET: "secret" });
    expect(options.rateLimit).toEqual({ enabled: true, window: 60, max: 20 });
  });

  it("installs the Next.js cookie plugin and names the app", async () => {
    const options = await loadAuth({ BETTER_AUTH_SECRET: "secret" });
    expect(nextCookies).toHaveBeenCalled();
    expect(options.plugins).toEqual([{ id: "next-cookies" }]);
    expect(options.appName).toBe("Nexus");
  });
});
