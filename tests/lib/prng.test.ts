import { describe, expect, it } from "vitest";

import { mulberry32 } from "@/app/lib/prng";

describe("mulberry32", () => {
  it("is deterministic for a given seed", () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    const runA = Array.from({ length: 20 }, () => a());
    const runB = Array.from({ length: 20 }, () => b());
    expect(runA).toEqual(runB);
  });

  it("produces different streams for different seeds", () => {
    const a = Array.from({ length: 10 }, mulberry32(1));
    const b = Array.from({ length: 10 }, mulberry32(2));
    expect(a).not.toEqual(b);
  });

  it("stays within [0, 1)", () => {
    const rand = mulberry32(0xc0ffee);
    for (let i = 0; i < 5000; i++) {
      const value = rand();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("advances the stream on each call", () => {
    const rand = mulberry32(7);
    const first = rand();
    const second = rand();
    expect(first).not.toBe(second);
  });

  it("handles seed 0 and negative seeds without producing NaN", () => {
    for (const seed of [0, -1, -(2 ** 31), 2 ** 31 - 1]) {
      const rand = mulberry32(seed);
      const values = Array.from({ length: 50 }, () => rand());
      expect(values.every(Number.isFinite)).toBe(true);
      expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    }
  });
});
