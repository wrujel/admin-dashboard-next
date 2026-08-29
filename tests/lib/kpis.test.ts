import { describe, expect, it } from "vitest";

import { buildOverviewKpis, ratio, sumBy } from "@/app/lib/kpis";
import type { RevenuePoint } from "@/app/lib/types";

/** Builds a revenue series with fully controlled numbers. */
function series(
  points: Array<Partial<RevenuePoint>> = [],
): RevenuePoint[] {
  return points.map((p, i) => ({
    date: new Date(2026, 0, i + 1).toISOString(),
    label: `Jan ${i + 1}`,
    revenue: 0,
    profit: 0,
    orders: 0,
    visitors: 0,
    ...p,
  }));
}

describe("sumBy", () => {
  it("sums a projected field", () => {
    expect(sumBy([{ n: 1 }, { n: 2 }, { n: 3 }], (x) => x.n)).toBe(6);
  });

  it("returns 0 for an empty array", () => {
    expect(sumBy([] as { n: number }[], (x) => x.n)).toBe(0);
  });

  it("handles negative values", () => {
    expect(sumBy([{ n: 5 }, { n: -8 }], (x) => x.n)).toBe(-3);
  });
});

describe("ratio", () => {
  it("computes relative change", () => {
    expect(ratio(120, 100)).toBeCloseTo(0.2);
    expect(ratio(80, 100)).toBeCloseTo(-0.2);
  });

  it("returns 0 when the previous period was zero (no divide-by-zero)", () => {
    expect(ratio(500, 0)).toBe(0);
    expect(ratio(0, 0)).toBe(0);
  });

  it("returns 0 for an unchanged value", () => {
    expect(ratio(100, 100)).toBe(0);
  });
});

describe("buildOverviewKpis", () => {
  it("returns the four overview cards in order", () => {
    const kpis = buildOverviewKpis(series([{ revenue: 1 }]), 10, 5);
    expect(kpis.map((k) => k.key)).toEqual([
      "revenue",
      "orders",
      "users",
      "conversion",
    ]);
  });

  it("totals revenue and orders across the whole window", () => {
    const data = series([
      { revenue: 100, orders: 2, visitors: 40 },
      { revenue: 300, orders: 6, visitors: 60 },
    ]);
    const [revenue, orders] = buildOverviewKpis(data, 0, 0);
    expect(revenue.value).toBe(400);
    expect(orders.value).toBe(8);
  });

  it("compares the recent half against the prior half", () => {
    const data = series([
      { revenue: 100, orders: 10, visitors: 100 },
      { revenue: 150, orders: 15, visitors: 100 },
    ]);
    const [revenue, orders] = buildOverviewKpis(data, 0, 0);
    // half = 1 -> prior = [100], recent = [150]
    expect(revenue.delta).toBeCloseTo(0.5);
    expect(orders.delta).toBeCloseTo(0.5);
  });

  it("passes the user count straight through and names the product count", () => {
    const [, , users] = buildOverviewKpis(series([{ revenue: 1 }]), 18420, 642);
    expect(users.value).toBe(18420);
    expect(users.hint).toBe("642 products live");
    expect(users.delta).toBe(0.082);
  });

  it("derives conversion from the recent half's orders and visitors", () => {
    const data = series([
      { revenue: 100, orders: 5, visitors: 100 },
      { revenue: 100, orders: 8, visitors: 100 },
    ]);
    const conversion = buildOverviewKpis(data, 0, 0)[3];
    // recent half: 8 orders / 100 visitors
    expect(conversion.value).toBeCloseTo(0.08);
  });

  it("accents conversion as primary at or above 6%", () => {
    const data = series([
      { revenue: 100, orders: 5, visitors: 100 },
      { revenue: 100, orders: 6, visitors: 100 },
    ]);
    expect(buildOverviewKpis(data, 0, 0)[3].accent).toBe("primary");
  });

  it("accents conversion as a warning below 6%", () => {
    const data = series([
      { revenue: 100, orders: 5, visitors: 100 },
      { revenue: 100, orders: 3, visitors: 100 },
    ]);
    expect(buildOverviewKpis(data, 0, 0)[3].accent).toBe("warning");
  });

  it("reports the average order value as a hint", () => {
    const data = series([
      { revenue: 500, orders: 5, visitors: 100 },
      { revenue: 500, orders: 5, visitors: 100 },
    ]);
    // 1000 revenue / 10 orders = 100
    expect(buildOverviewKpis(data, 0, 0)[3].hint).toBe("AOV 100 USD");
  });

  it("survives an empty series without dividing by zero", () => {
    const kpis = buildOverviewKpis([], 0, 0);
    expect(kpis.every((k) => Number.isFinite(k.value))).toBe(true);
    expect(kpis.every((k) => Number.isFinite(k.delta))).toBe(true);
    expect(kpis[0].value).toBe(0);
    expect(kpis[3].value).toBe(0);
    expect(kpis[3].accent).toBe("warning");
    expect(kpis[3].hint).toBe("AOV 0 USD");
  });

  it("guards conversion when there are zero visitors", () => {
    const data = series([{ revenue: 10, orders: 3, visitors: 0 }]);
    const conversion = buildOverviewKpis(data, 0, 0)[3];
    expect(conversion.value).toBe(0);
    expect(Number.isFinite(conversion.delta)).toBe(true);
    expect(conversion.spark.every(Number.isFinite)).toBe(true);
  });

  it("caps every sparkline at the last 14 points", () => {
    const data = series(
      Array.from({ length: 30 }, (_, i) => ({
        revenue: i,
        orders: i,
        visitors: i + 1,
      })),
    );
    for (const kpi of buildOverviewKpis(data, 0, 0)) {
      expect(kpi.spark).toHaveLength(14);
    }
  });

  it("keeps sparklines shorter than 14 points intact", () => {
    const data = series([{ revenue: 1 }, { revenue: 2 }]);
    expect(buildOverviewKpis(data, 0, 0)[0].spark).toEqual([1, 2]);
  });

  it("tags each card with the format its value should render as", () => {
    const kpis = buildOverviewKpis(series([{ revenue: 1 }]), 1, 1);
    expect(kpis.map((k) => k.format)).toEqual([
      "currency",
      "number",
      "compact",
      "percent",
    ]);
  });
});
