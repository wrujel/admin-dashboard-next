import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import * as mock from "@/app/lib/mock";
import { CATALOG } from "@/app/lib/fixtures";
import type { RevenueRange } from "@/app/lib/types";

const RANGES: RevenueRange[] = ["7d", "30d", "q", "s", "y"];

/**
 * The module seeds one shared PRNG at import time, so generator output depends
 * on call order within a file. Assertions here are therefore structural
 * (shape, ranges, invariants) rather than snapshots of exact numbers — except
 * for the independently seeded generators, which are checked for determinism.
 *
 * The clock is frozen for the whole file: the generators stamp rows with
 * `new Date()`, so two otherwise-identical calls a millisecond apart would
 * differ on `date` alone and make the determinism assertions flaky.
 */
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-24T12:00:00.000Z"));
});

afterAll(() => {
  vi.useRealTimers();
});

describe("revenueSeries", () => {
  it("returns 30 points by default, oldest first", () => {
    const series = mock.revenueSeries();
    expect(series).toHaveLength(30);
    const times = series.map((p) => new Date(p.date).getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("honours a custom day count", () => {
    expect(mock.revenueSeries(7)).toHaveLength(7);
    expect(mock.revenueSeries(1)).toHaveLength(1);
  });

  it("returns an empty series for zero days", () => {
    expect(mock.revenueSeries(0)).toEqual([]);
  });

  it("keeps every point positive and internally coherent", () => {
    for (const point of mock.revenueSeries(30)) {
      expect(point.revenue).toBeGreaterThan(0);
      expect(point.profit).toBeGreaterThan(0);
      expect(point.orders).toBeGreaterThan(0);
      expect(point.visitors).toBeGreaterThan(point.orders);
      expect(point.profit).toBeLessThan(point.revenue);
      expect(Number.isInteger(point.revenue)).toBe(true);
      expect(new Date(point.date).toISOString()).toBe(point.date);
      expect(point.label).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
    }
  });

  it("holds the daily floor even over a long window", () => {
    for (const point of mock.revenueSeries(200)) {
      expect(point.revenue).toBeGreaterThan(0);
    }
  });
});

describe("sparkFrom", () => {
  it("takes the last 14 values by default", () => {
    const series = Array.from({ length: 30 }, (_, i) => i);
    expect(mock.sparkFrom(series)).toEqual(series.slice(-14));
  });

  it("honours a custom length", () => {
    expect(mock.sparkFrom([1, 2, 3, 4, 5], 2)).toEqual([4, 5]);
  });

  it("returns the whole series when it is shorter than the window", () => {
    expect(mock.sparkFrom([1, 2], 14)).toEqual([1, 2]);
  });

  it("returns an empty array for an empty series", () => {
    expect(mock.sparkFrom([], 5)).toEqual([]);
  });
});

describe("categoryBreakdown", () => {
  it("returns one entry per category, sorted by value descending", () => {
    const rows = mock.categoryBreakdown();
    expect(rows).toHaveLength(6);
    const values = rows.map((r) => r.value);
    expect([...values].sort((a, b) => b - a)).toEqual(values);
  });

  it("gives every row a name, a CSS colour var and an in-range value", () => {
    for (const row of mock.categoryBreakdown()) {
      expect(row.name).toBeTruthy();
      expect(row.color).toMatch(/^var\(--color-[a-z0-9-]+\)$/);
      expect(row.value).toBeGreaterThanOrEqual(120);
      expect(row.value).toBeLessThanOrEqual(980);
    }
  });
});

describe("trafficSources", () => {
  it("returns the five acquisition channels", () => {
    expect(mock.trafficSources().map((t) => t.source)).toEqual([
      "Organic",
      "Direct",
      "Referral",
      "Social",
      "Email",
    ]);
  });

  it("keeps visitor counts within the documented range", () => {
    for (const row of mock.trafficSources()) {
      expect(row.visitors).toBeGreaterThanOrEqual(800);
      expect(row.visitors).toBeLessThanOrEqual(6400);
      expect(row.color).toMatch(/^var\(--color-/);
    }
  });
});

describe("transactions", () => {
  it("returns 8 rows by default and honours an explicit count", () => {
    expect(mock.transactions()).toHaveLength(8);
    expect(mock.transactions(3)).toHaveLength(3);
    expect(mock.transactions(0)).toEqual([]);
  });

  it("gives every row a padded id, a derived email and a valid status", () => {
    for (const tx of mock.transactions(12)) {
      expect(tx.id).toMatch(/^tx_\d{4}$/);
      expect(tx.email).toMatch(/^[a-z.]+\d+@example\.com$/);
      expect(["completed", "pending", "failed", "refunded"]).toContain(
        tx.status,
      );
      expect(tx.amount).toBeGreaterThanOrEqual(40);
      expect(tx.amount).toBeLessThanOrEqual(2400);
      expect(tx.name.split(" ")).toHaveLength(2);
      expect(new Date(tx.date).toISOString()).toBe(tx.date);
    }
  });

  it("dates every transaction within the last week", () => {
    const weekAgo = Date.now() - 7 * 86_400_000;
    for (const tx of mock.transactions(20)) {
      expect(new Date(tx.date).getTime()).toBeGreaterThanOrEqual(weekAgo);
    }
  });
});

describe("topProducts", () => {
  it("returns 6 rows by default, sorted by revenue descending", () => {
    const rows = mock.topProducts();
    expect(rows).toHaveLength(6);
    const revenues = rows.map((r) => r.revenue);
    expect([...revenues].sort((a, b) => b - a)).toEqual(revenues);
  });

  it("honours an explicit count", () => {
    expect(mock.topProducts(3)).toHaveLength(3);
    expect(mock.topProducts(0)).toEqual([]);
  });

  it("only names real catalog products, with a 12-point trend", () => {
    const names = new Set(CATALOG.map((p) => p.name));
    for (const row of mock.topProducts(6)) {
      expect(names).toContain(row.name);
      expect(row.trend).toHaveLength(12);
      expect(row.units).toBeGreaterThan(0);
      expect(row.id).toMatch(/^prod_\d{4}$/);
    }
  });

  it("keeps revenue coherent with units times catalog price", () => {
    const priceOf = new Map(CATALOG.map((p) => [p.name, p.price]));
    for (const row of mock.topProducts(6)) {
      const expected = row.units * priceOf.get(row.name)!;
      expect(row.revenue).toBeLessThanOrEqual(expected);
      expect(row.revenue).toBeGreaterThan(expected * 0.9);
    }
  });
});

describe("activity", () => {
  it("is deterministic across calls", () => {
    expect(mock.activity(10)).toEqual(mock.activity(10));
  });

  it("makes a short feed a strict prefix of a longer one", () => {
    expect(mock.activity(30).slice(0, 8)).toEqual(mock.activity(8));
  });

  it("returns 8 items by default and honours an explicit count", () => {
    expect(mock.activity()).toHaveLength(8);
    expect(mock.activity(24)).toHaveLength(24);
    expect(mock.activity(0)).toEqual([]);
  });

  it("orders events most-recent first", () => {
    const times = mock.activity(20).map((a) => new Date(a.date).getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  it("gives every event a known type, an actor and a target", () => {
    for (const item of mock.activity(30)) {
      expect(["user", "order", "product", "auth", "system"]).toContain(
        item.type,
      );
      expect(item.actor.split(" ")).toHaveLength(2);
      expect(item.action).toBeTruthy();
      expect(item.target).toBeTruthy();
      expect(item.id).toMatch(/^act_\d{4}$/);
    }
  });
});

describe("users", () => {
  it("returns 32 rows by default and honours an explicit count", () => {
    expect(mock.users()).toHaveLength(32);
    expect(mock.users(5)).toHaveLength(5);
    expect(mock.users(0)).toEqual([]);
  });

  it("gives every row a valid role, status and derived spend", () => {
    for (const user of mock.users(40)) {
      expect(["admin", "editor", "viewer"]).toContain(user.role);
      expect(["active", "invited", "suspended"]).toContain(user.status);
      expect(user.orders).toBeGreaterThanOrEqual(0);
      expect(user.orders).toBeLessThanOrEqual(120);
      expect(user.spend).toBeGreaterThanOrEqual(0);
      expect(user.id).toMatch(/^usr_\d{4}$/);
      expect(user.email).toContain("@example.com");
    }
  });

  it("keeps spend proportional to order count", () => {
    for (const user of mock.users(40)) {
      expect(user.spend).toBeGreaterThanOrEqual(user.orders * 45 - 1);
      expect(user.spend).toBeLessThanOrEqual(user.orders * 260 + 1);
    }
  });
});

describe("products", () => {
  it("returns 28 rows by default and honours an explicit count", () => {
    expect(mock.products()).toHaveLength(28);
    expect(mock.products(4)).toHaveLength(4);
    expect(mock.products(0)).toEqual([]);
  });

  it("marks any zero-stock row out of stock", () => {
    for (const product of mock.products(60)) {
      if (product.stock === 0) expect(product.status).toBe("out_of_stock");
      expect(["active", "draft", "out_of_stock"]).toContain(product.status);
    }
  });

  it("suffixes names once the catalog wraps around", () => {
    const rows = mock.products(20);
    expect(rows[0].name).not.toMatch(/ v2$/);
    expect(rows[16].name).toMatch(/ v2$/);
  });

  it("keeps price and stock in range", () => {
    for (const product of mock.products(40)) {
      expect(product.price).toBeGreaterThanOrEqual(9);
      expect(product.price).toBeLessThanOrEqual(1899);
      expect(product.stock).toBeGreaterThanOrEqual(0);
      expect(product.id).toMatch(/^prd_\d{4}$/);
    }
  });
});

describe("revenueRangeSeries", () => {
  it.each(RANGES)("is deterministic for range %s", (range) => {
    expect(mock.revenueRangeSeries(range)).toEqual(
      mock.revenueRangeSeries(range),
    );
  });

  it("uses the documented point count per range", () => {
    expect(mock.revenueRangeSeries("7d")).toHaveLength(7);
    expect(mock.revenueRangeSeries("30d")).toHaveLength(30);
    expect(mock.revenueRangeSeries("q")).toHaveLength(13);
    expect(mock.revenueRangeSeries("s")).toHaveLength(26);
    expect(mock.revenueRangeSeries("y")).toHaveLength(12);
  });

  it("labels day-granularity ranges with month and day", () => {
    for (const range of ["7d", "30d", "q", "s"] as RevenueRange[]) {
      for (const point of mock.revenueRangeSeries(range)) {
        expect(point.label).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
      }
    }
  });

  it("labels the yearly range with month names only", () => {
    for (const point of mock.revenueRangeSeries("y")) {
      expect(point.label).toMatch(/^[A-Z][a-z]{2}$/);
    }
  });

  it.each(RANGES)("keeps range %s coherent and ordered", (range) => {
    const series = mock.revenueRangeSeries(range);
    const times = series.map((p) => new Date(p.date).getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    for (const point of series) {
      expect(point.revenue).toBeGreaterThan(0);
      expect(point.profit).toBeGreaterThan(0);
      expect(point.profit).toBeLessThan(point.revenue);
      expect(point.orders).toBeGreaterThan(0);
      expect(point.visitors).toBeGreaterThan(point.orders);
    }
  });

  it("scales longer steps to larger per-point revenue", () => {
    const daily = mock.revenueRangeSeries("30d")[0].revenue;
    const weekly = mock.revenueRangeSeries("q")[0].revenue;
    expect(weekly).toBeGreaterThan(daily);
  });
});

describe("revenue breakdowns", () => {
  const breakdowns = [
    ["revenueByChannel", mock.revenueByChannel, 5],
    ["revenueByCategory", mock.revenueByCategory, 6],
    ["revenueByRegion", mock.revenueByRegion, 5],
  ] as const;

  it.each(breakdowns)(
    "%s returns the expected rows, sorted descending",
    (_name, fn, count) => {
      for (const range of RANGES) {
        const rows = fn(range);
        expect(rows).toHaveLength(count);
        const values = rows.map((r) => r.value);
        expect([...values].sort((a, b) => b - a)).toEqual(values);
        for (const row of rows) {
          expect(row.value).toBeGreaterThan(0);
          expect(row.color).toMatch(/^var\(--color-/);
          expect(row.name).toBeTruthy();
        }
      }
    },
  );

  it.each(breakdowns)("%s is deterministic", (_name, fn) => {
    for (const range of RANGES) {
      expect(fn(range)).toEqual(fn(range));
    }
  });

  it.each(breakdowns)("%s scales with the range length", (_name, fn) => {
    const short = fn("7d").reduce((a, d) => a + d.value, 0);
    const long = fn("y").reduce((a, d) => a + d.value, 0);
    expect(long).toBeGreaterThan(short);
  });

  it("names the expected channels and regions", () => {
    expect(new Set(mock.revenueByChannel("30d").map((r) => r.name))).toEqual(
      new Set([
        "Online store",
        "Marketplace",
        "Retail / POS",
        "Wholesale",
        "Social",
      ]),
    );
    expect(new Set(mock.revenueByRegion("30d").map((r) => r.name))).toEqual(
      new Set([
        "North America",
        "Europe",
        "Asia Pacific",
        "Latin America",
        "Middle East & Africa",
      ]),
    );
  });
});
