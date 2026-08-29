import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `app/lib/utils.ts` reads MONGO_URI once, at module load. Every case here
 * therefore resets the module registry, sets the environment, and re-imports.
 */

const connect = vi.fn();
const connections: Array<{ readyState: number }> = [{ readyState: 0 }];

vi.mock("mongoose", () => ({
  default: {
    get connections() {
      return connections;
    },
    connect,
  },
}));

async function loadConnectToDB(uri?: string) {
  vi.resetModules();
  if (uri === undefined) delete process.env.MONGO_URI;
  else process.env.MONGO_URI = uri;
  const mod = await import("@/app/lib/utils");
  return mod.connectToDB;
}

beforeEach(() => {
  connect.mockReset().mockResolvedValue(undefined);
  connections[0].readyState = 0;
});

afterEach(() => {
  delete process.env.MONGO_URI;
});

describe("connectToDB", () => {
  it("connects when disconnected and a URI is configured", async () => {
    const connectToDB = await loadConnectToDB("mongodb://localhost/test");
    await connectToDB();
    expect(connect).toHaveBeenCalledExactlyOnceWith("mongodb://localhost/test");
  });

  it("does nothing when a connection is already open", async () => {
    const connectToDB = await loadConnectToDB("mongodb://localhost/test");
    connections[0].readyState = 1;
    await connectToDB();
    expect(connect).not.toHaveBeenCalled();
  });

  it("does nothing when no URI is configured", async () => {
    const connectToDB = await loadConnectToDB(undefined);
    await connectToDB();
    expect(connect).not.toHaveBeenCalled();
  });

  it("does nothing when the URI is empty", async () => {
    const connectToDB = await loadConnectToDB("");
    await connectToDB();
    expect(connect).not.toHaveBeenCalled();
  });

  it("wraps a driver failure in a generic error", async () => {
    const connectToDB = await loadConnectToDB("mongodb://localhost/test");
    connect.mockRejectedValue(new Error("ECONNREFUSED at 127.0.0.1:27017"));
    await expect(connectToDB()).rejects.toThrow("Error connecting to database");
  });

  it("does not leak the driver's message to the caller", async () => {
    const connectToDB = await loadConnectToDB("mongodb://localhost/test");
    connect.mockRejectedValue(new Error("bad credentials for user root"));
    await expect(connectToDB()).rejects.not.toThrow(/root/);
  });
});
