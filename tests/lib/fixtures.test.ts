import { describe, expect, it } from "vitest";

import {
  ACTIVITY_TEMPLATES,
  CATALOG,
  CATEGORIES,
  FIRST_NAMES,
  LAST_NAMES,
  PAYMENT_METHODS,
  PRODUCT_COLORS,
  PRODUCT_NAMES,
  PRODUCT_SIZES,
  TX_STATUS_POOL,
} from "@/app/lib/fixtures";
import { mulberry32 } from "@/app/lib/prng";

describe("name and label pools", () => {
  it.each([
    ["FIRST_NAMES", FIRST_NAMES],
    ["LAST_NAMES", LAST_NAMES],
    ["CATEGORIES", CATEGORIES],
    ["PAYMENT_METHODS", PAYMENT_METHODS],
    ["PRODUCT_COLORS", PRODUCT_COLORS],
    ["PRODUCT_SIZES", PRODUCT_SIZES],
  ])("%s is a non-empty list of unique non-empty strings", (_label, pool) => {
    expect(pool.length).toBeGreaterThan(0);
    expect(new Set(pool).size).toBe(pool.length);
    expect(pool.every((v) => typeof v === "string" && v.length > 0)).toBe(true);
  });
});

describe("CATALOG", () => {
  it("has unique product names", () => {
    const names = CATALOG.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("prices every item above zero", () => {
    expect(CATALOG.every((p) => p.price > 0)).toBe(true);
  });

  it("keeps every margin a sane 0..1 ratio", () => {
    expect(CATALOG.every((p) => p.margin > 0 && p.margin < 1)).toBe(true);
  });

  it("gives every item a positive popularity weight", () => {
    expect(CATALOG.every((p) => p.weight > 0)).toBe(true);
  });

  it("only uses categories from the shared category list", () => {
    for (const item of CATALOG) {
      expect(CATEGORIES).toContain(item.category);
    }
  });

  it("covers every category at least once", () => {
    const used = new Set(CATALOG.map((p) => p.category));
    for (const category of CATEGORIES) {
      expect(used).toContain(category);
    }
  });
});

describe("PRODUCT_NAMES", () => {
  it("mirrors the catalog names in order", () => {
    expect(PRODUCT_NAMES).toEqual(CATALOG.map((p) => p.name));
  });
});

describe("TX_STATUS_POOL", () => {
  it("weights 'completed' as the most common outcome", () => {
    const counts = new Map<string, number>();
    for (const status of TX_STATUS_POOL) {
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }
    const completed = counts.get("completed") ?? 0;
    for (const [status, count] of counts) {
      if (status !== "completed") expect(completed).toBeGreaterThan(count);
    }
  });

  it("includes each of the four statuses", () => {
    expect(new Set(TX_STATUS_POOL)).toEqual(
      new Set(["completed", "pending", "failed", "refunded"]),
    );
  });
});

describe("ACTIVITY_TEMPLATES", () => {
  it("gives every template a type and an action", () => {
    for (const template of ACTIVITY_TEMPLATES) {
      expect(template.type).toBeTruthy();
      expect(template.action).toBeTruthy();
    }
  });

  it("produces a non-empty target for every template", () => {
    const rand = mulberry32(42);
    for (const template of ACTIVITY_TEMPLATES) {
      expect(template.target(rand)).toBeTruthy();
    }
  });

  it("formats order targets as a five-digit ticket number", () => {
    const rand = mulberry32(7);
    const orders = ACTIVITY_TEMPLATES.filter((t) => t.type === "order");
    expect(orders.length).toBeGreaterThan(0);
    for (const template of orders) {
      expect(template.target(rand)).toMatch(/^#\d{5}$/);
    }
  });

  it("names a real catalog product for the product template", () => {
    const template = ACTIVITY_TEMPLATES.find((t) => t.type === "product")!;
    const rand = mulberry32(3);
    for (let i = 0; i < 50; i++) {
      expect(PRODUCT_NAMES).toContain(template.target(rand));
    }
  });

  it("returns fixed copy for the templates that ignore the RNG", () => {
    const rand = mulberry32(1);
    const fixed = ACTIVITY_TEMPLATES.filter((t) =>
      ["user", "auth", "system"].includes(t.type),
    );
    expect(fixed.length).toBe(3);
    for (const template of fixed) {
      expect(template.target(rand)).toBe(template.target(rand));
    }
  });
});
