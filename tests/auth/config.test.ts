import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `authConfigured` is evaluated once at module load, so each case resets the
 * module registry and re-imports with the environment under test.
 */

const KEYS = ["MONGO_URI", "BETTER_AUTH_SECRET", "AUTH_SECRET"] as const;

async function loadConfig(env: Partial<Record<(typeof KEYS)[number], string>>) {
  vi.resetModules();
  for (const key of KEYS) delete process.env[key];
  for (const [key, value] of Object.entries(env)) process.env[key] = value;
  const mod = await import("@/app/lib/auth/config");
  return mod.authConfigured;
}

afterEach(() => {
  for (const key of KEYS) delete process.env[key];
});

describe("authConfigured", () => {
  it("is true with a database and BETTER_AUTH_SECRET", async () => {
    await expect(
      loadConfig({ MONGO_URI: "mongodb://db", BETTER_AUTH_SECRET: "s3cret" }),
    ).resolves.toBe(true);
  });

  it("accepts AUTH_SECRET as the secret", async () => {
    await expect(
      loadConfig({ MONGO_URI: "mongodb://db", AUTH_SECRET: "s3cret" }),
    ).resolves.toBe(true);
  });

  it("is false without a database, even with a secret", async () => {
    await expect(loadConfig({ BETTER_AUTH_SECRET: "s3cret" })).resolves.toBe(
      false,
    );
  });

  it("is false with a database but no secret", async () => {
    await expect(loadConfig({ MONGO_URI: "mongodb://db" })).resolves.toBe(
      false,
    );
  });

  it("is false with neither", async () => {
    await expect(loadConfig({})).resolves.toBe(false);
  });

  it("treats empty strings as unset", async () => {
    await expect(
      loadConfig({ MONGO_URI: "", BETTER_AUTH_SECRET: "s3cret" }),
    ).resolves.toBe(false);
    await expect(
      loadConfig({ MONGO_URI: "mongodb://db", BETTER_AUTH_SECRET: "" }),
    ).resolves.toBe(false);
  });

  it("always returns a boolean, never a truthy string", async () => {
    const value = await loadConfig({
      MONGO_URI: "mongodb://db",
      BETTER_AUTH_SECRET: "s3cret",
    });
    expect(typeof value).toBe("boolean");
  });
});
