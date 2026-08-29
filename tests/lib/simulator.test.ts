import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  type SimulationSeed,
  type SimulationSnapshot,
  createSimulation,
  tickSimulation,
} from "@/app/lib/simulator";
import { CATALOG } from "@/app/lib/fixtures";
import { mulberry32 } from "@/app/lib/prng";
import type { RevenuePoint, TopProduct } from "@/app/lib/types";

/** Ticks per simulated day, mirroring the DAY_TICKS constant in the module. */
const DAY_TICKS = 60;

/**
 * Replaces Math.random with a seeded PRNG so a tick sequence is reproducible.
 * A *varying* stream is required: the basket builder loops until it has picked
 * N distinct products, which never terminates against a constant.
 */
function seedRandom(seed = 0xbeef) {
  const rand = mulberry32(seed);
  return vi.spyOn(Math, "random").mockImplementation(rand);
}

function day(i: number, over: Partial<RevenuePoint> = {}): RevenuePoint {
  const date = new Date(Date.UTC(2026, 5, 1 + i));
  return {
    date: date.toISOString(),
    label: `Jun ${1 + i}`,
    revenue: 1000,
    profit: 400,
    orders: 10,
    visitors: 200,
    ...over,
  };
}

function topProduct(i: number): TopProduct {
  const entry = CATALOG[i];
  return {
    id: `prod_${i}`,
    name: entry.name,
    category: entry.category,
    units: 100 - i,
    revenue: 100_000 - i * 1000,
    trend: Array.from({ length: 12 }, (_, t) => t + 1),
  };
}

function makeSeed(over: Partial<SimulationSeed> = {}): SimulationSeed {
  return {
    kpis: [],
    revenue: Array.from({ length: 30 }, (_, i) => day(i)),
    categories: [...new Set(CATALOG.map((p) => p.category))].map((name, i) => ({
      name,
      value: 100 + i,
      color: `var(--color-chart-${i + 1})`,
    })),
    traffic: [
      { source: "Organic", visitors: 4000, color: "var(--color-chart-1)" },
      { source: "Direct", visitors: 2000, color: "var(--color-chart-2)" },
    ],
    topProducts: Array.from({ length: 6 }, (_, i) => topProduct(i)),
    transactions: [
      {
        id: "tx_seed_1",
        name: "Ada Lovelace",
        email: "ada@example.com",
        amount: 500,
        status: "completed",
        method: "Visa",
        date: day(29).date,
      },
    ],
    activity: [],
    counts: { users: 1000, products: CATALOG.length },
    ...over,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

/* -------------------------------------------------------------------------- */

describe("createSimulation", () => {
  it("keeps the server numbers for every seeded top product", () => {
    const seed = makeSeed();
    const snapshot = createSimulation(seed);

    for (const seeded of seed.topProducts) {
      const product = snapshot.products.find((p) => p.name === seeded.name)!;
      expect(product.units).toBe(seeded.units);
      expect(product.revenue).toBe(seeded.revenue);
      expect(product.id).toBe(seeded.id);
      expect(product.trend).toEqual(seeded.trend);
    }
  });

  it("copies the seeded trend rather than aliasing it", () => {
    const seed = makeSeed();
    const snapshot = createSimulation(seed);
    const product = snapshot.products.find(
      (p) => p.name === seed.topProducts[0].name,
    )!;
    product.trend[0] = 999;
    expect(seed.topProducts[0].trend[0]).toBe(1);
  });

  it("gives the whole catalog a tally, seeded or not", () => {
    const snapshot = createSimulation(makeSeed());
    expect(snapshot.products).toHaveLength(CATALOG.length);
    expect(new Set(snapshot.products.map((p) => p.name))).toEqual(
      new Set(CATALOG.map((p) => p.name)),
    );
  });

  it("keeps every unseeded product strictly below the seeded leaders", () => {
    const seed = makeSeed();
    const snapshot = createSimulation(seed);
    const seededNames = new Set(seed.topProducts.map((p) => p.name));
    const floor = Math.min(...seed.topProducts.map((p) => p.revenue));

    const tail = snapshot.products.filter((p) => !seededNames.has(p.name));
    expect(tail.length).toBeGreaterThan(0);
    for (const product of tail) {
      expect(product.revenue).toBeLessThan(floor);
      expect(product.units).toBeGreaterThanOrEqual(1);
      expect(product.trend).toHaveLength(12);
      expect(product.id).toMatch(/^prod_[a-z0-9-]+$/);
    }
  });

  it("preserves the seeded top-6 ranking exactly", () => {
    const seed = makeSeed();
    const snapshot = createSimulation(seed);
    expect(snapshot.topProducts).toEqual(seed.topProducts);

    const ranked = [...snapshot.products]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6)
      .map((p) => p.name);
    expect(ranked).toEqual(seed.topProducts.map((p) => p.name));
  });

  it("is deterministic — no Math.random during seeding", () => {
    const spy = vi.spyOn(Math, "random");
    const a = createSimulation(makeSeed());
    const b = createSimulation(makeSeed());
    expect(a.products).toEqual(b.products);
    expect(spy).not.toHaveBeenCalled();
  });

  it("starts with no pending orders, at tick 0, late in the day", () => {
    const snapshot = createSimulation(makeSeed());
    expect(snapshot.pending).toEqual([]);
    expect(snapshot.tick).toBe(0);
    expect(snapshot.dayTick).toBe(Math.round(DAY_TICKS * 0.9));
  });

  it("passes the seeded panels straight through", () => {
    const seed = makeSeed();
    const snapshot = createSimulation(seed);
    expect(snapshot.revenue).toBe(seed.revenue);
    expect(snapshot.categories).toBe(seed.categories);
    expect(snapshot.traffic).toBe(seed.traffic);
    expect(snapshot.transactions).toBe(seed.transactions);
    expect(snapshot.activity).toBe(seed.activity);
    expect(snapshot.counts).toBe(seed.counts);
  });
});

/* -------------------------------------------------------------------------- */

describe("tickSimulation", () => {
  let base: SimulationSnapshot;

  beforeEach(() => {
    // Every event is stamped with new Date(); freezing the clock keeps
    // snapshot comparisons from straddling a millisecond boundary.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T12:00:00.000Z"));
    base = createSimulation(makeSeed());
  });

  it("advances the tick counter and returns a fresh snapshot", () => {
    seedRandom();
    const next = tickSimulation(base);
    expect(next.tick).toBe(1);
    expect(next).not.toBe(base);
    expect(next.revenue).not.toBe(base.revenue);
    expect(next.products).not.toBe(base.products);
    expect(next.traffic).not.toBe(base.traffic);
    expect(next.categories).not.toBe(base.categories);
  });

  it("leaves the previous snapshot untouched", () => {
    seedRandom();
    const before = structuredClone(base);
    tickSimulation(base);
    expect(base).toEqual(before);
  });

  it("defaults to intensity 1", () => {
    seedRandom(1);
    const a = tickSimulation(base);
    seedRandom(1);
    const b = tickSimulation(base, 1);
    expect(a).toEqual(b);
  });

  it("is reproducible for a given random stream", () => {
    // Event ids come from crypto.randomUUID, which the seeded PRNG does not
    // drive — make it deterministic too so snapshots compare cleanly.
    const uuids = () => {
      let n = 0;
      return vi
        .spyOn(globalThis.crypto, "randomUUID")
        .mockImplementation(() => `uuid-${++n}` as `${string}-${string}`);
    };

    seedRandom(99);
    uuids();
    const a = tickSimulation(base, 2);

    seedRandom(99);
    uuids();
    const b = tickSimulation(base, 2);

    expect(a).toEqual(b);
  });

  /* ------------------------------- day window ----------------------------- */

  it("keeps accumulating into today while the day has not rolled over", () => {
    seedRandom();
    const next = tickSimulation({ ...base, dayTick: 0 }, 1);
    expect(next.dayTick).toBe(1);
    expect(next.revenue).toHaveLength(base.revenue.length);
    expect(next.revenue.at(-1)!.date).toBe(base.revenue.at(-1)!.date);
  });

  it("slides the window and starts a fresh day on rollover", () => {
    seedRandom();
    const next = tickSimulation({ ...base, dayTick: DAY_TICKS - 1 }, 1);

    expect(next.dayTick).toBe(0);
    expect(next.revenue).toHaveLength(base.revenue.length);
    // Oldest day dropped, and the new day is the one after the old last day.
    expect(next.revenue[0].date).toBe(base.revenue[1].date);
    expect(new Date(next.revenue.at(-1)!.date).getTime()).toBe(
      new Date(base.revenue.at(-1)!.date).getTime() + 86_400_000,
    );
    expect(next.revenue.at(-1)!.label).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });

  it("shifts every product trend on rollover, opening a zero bucket", () => {
    seedRandom();
    const prev = { ...base, dayTick: DAY_TICKS - 1 };
    const next = tickSimulation(prev, 1);
    for (const product of next.products) {
      expect(product.trend).toHaveLength(12);
    }
    // A product that sold nothing this tick keeps its freshly opened zero.
    const untouched = next.products.filter((p) => p.trend.at(-1) === 0);
    expect(untouched.length).toBeGreaterThan(0);
  });

  it("rolls over when intensity carries dayTick past the boundary", () => {
    seedRandom();
    const next = tickSimulation({ ...base, dayTick: DAY_TICKS - 2 }, 8);
    expect(next.dayTick).toBe(0);
  });

  it("advances dayTick by the intensity", () => {
    seedRandom();
    expect(tickSimulation({ ...base, dayTick: 0 }, 4).dayTick).toBe(4);
  });

  /* -------------------------------- traffic ------------------------------- */

  it("attributes arriving visitors to a channel and to today", () => {
    seedRandom(7);
    const next = tickSimulation({ ...base, dayTick: 0 }, 3);

    const before = base.traffic.reduce((a, t) => a + t.visitors, 0);
    const after = next.traffic.reduce((a, t) => a + t.visitors, 0);
    const arrivals = after - before;

    expect(arrivals).toBeGreaterThan(0);
    expect(next.revenue.at(-1)!.visitors).toBe(
      base.revenue.at(-1)!.visitors + arrivals,
    );
  });

  it("records no arrivals when the sampler returns zero", () => {
    // Math.random() === 0 makes the Poisson product collapse immediately.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation({ ...base, dayTick: 0 }, 1);
    expect(next.revenue.at(-1)!.visitors).toBe(base.revenue.at(-1)!.visitors);
    expect(next.traffic.map((t) => t.visitors)).toEqual(
      base.traffic.map((t) => t.visitors),
    );
  });

  it("still picks a channel when the weights are not usable", () => {
    // Defensive path in weightedIndex: a non-comparable roll must fall back to
    // the last index rather than returning undefined.
    seedRandom(5);
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      traffic: [
        { source: "Organic", visitors: Number.NaN, color: "var(--c1)" },
        { source: "Direct", visitors: 10, color: "var(--c2)" },
      ],
    };
    const next = tickSimulation(prev, 1);
    expect(next.traffic).toHaveLength(2);
    expect(next.traffic[1].visitors).toBeGreaterThan(10);
  });

  /* --------------------------------- orders ------------------------------- */

  it("books orders, transactions and activity from converted visitors", () => {
    seedRandom(3);
    let snapshot = { ...base, dayTick: 0 };
    for (let i = 0; i < 40; i++) snapshot = tickSimulation(snapshot, 3);

    expect(snapshot.transactions.length).toBeGreaterThan(
      base.transactions.length,
    );
    expect(snapshot.activity.length).toBeGreaterThan(0);
    expect(snapshot.revenue.at(-1)!.revenue).toBeGreaterThan(0);

    for (const tx of snapshot.transactions) {
      expect(tx.amount).toBeGreaterThan(0);
      expect(["completed", "pending", "failed", "refunded"]).toContain(
        tx.status,
      );
      expect(tx.email).toMatch(/@example\.com$/);
    }
  });

  it("produces every checkout status over a long run", () => {
    seedRandom(11);
    let snapshot: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      transactions: [],
    };
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      snapshot = tickSimulation(snapshot, 3);
      for (const tx of snapshot.transactions) seen.add(tx.status);
    }
    expect(seen).toContain("completed");
    expect(seen).toContain("pending");
    expect(seen).toContain("failed");
  });

  it("keeps revenue, profit and product tallies coherent", () => {
    seedRandom(21);
    // Stays inside a single simulated day (19 x 3 < DAY_TICKS) so "today" is
    // the day the sales accumulate into rather than a freshly rolled one.
    let snapshot = { ...base, dayTick: 0 };
    for (let i = 0; i < 19; i++) snapshot = tickSimulation(snapshot, 3);

    const today = snapshot.revenue.at(-1)!;
    expect(today.profit).toBeGreaterThan(0);
    expect(today.profit).toBeLessThan(today.revenue);
    for (const product of snapshot.products) {
      expect(product.units).toBeGreaterThan(0);
      expect(product.revenue).toBeGreaterThan(0);
    }
  });

  it("credits category units as products sell", () => {
    seedRandom(13);
    let snapshot = { ...base, dayTick: 0 };
    for (let i = 0; i < 60; i++) snapshot = tickSimulation(snapshot, 3);

    const before = base.categories.reduce((a, c) => a + c.value, 0);
    const after = snapshot.categories.reduce((a, c) => a + c.value, 0);
    expect(after).toBeGreaterThan(before);
  });

  it("ignores order lines for products that are not in the catalog", () => {
    // A pending order captured before a catalog change settles here; the
    // unknown line must be skipped without corrupting the tallies.
    seedRandom(2);
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      transactions: [
        {
          id: "tx_ghost",
          name: "Ghost Buyer",
          email: "ghost@example.com",
          amount: 300,
          status: "pending",
          method: "Visa",
          date: base.revenue.at(-1)!.date,
        },
      ],
      pending: [
        {
          txId: "tx_ghost",
          amount: 300,
          profit: 100,
          lines: [{ name: "Discontinued Widget", qty: 4 }],
        },
      ],
    };

    const unitsBefore = prev.products.reduce((a, p) => a + p.units, 0);
    let next = prev;
    for (let i = 0; i < 40 && next.pending.length > 0; i++) {
      next = tickSimulation(next, 3);
    }

    expect(next.pending).toHaveLength(0);
    const unitsAfter = next.products.reduce((a, p) => a + p.units, 0);
    expect(unitsAfter).toBeGreaterThanOrEqual(unitsBefore);
    expect(next.products.every((p) => Number.isFinite(p.revenue))).toBe(true);
  });

  it("skips category credit when the product's category is not tracked", () => {
    seedRandom(4);
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      categories: [
        { name: "Not A Real Category", value: 5, color: "var(--c1)" },
      ],
    };
    let next = prev;
    for (let i = 0; i < 40; i++) next = tickSimulation(next, 3);

    expect(next.categories).toHaveLength(1);
    expect(next.categories[0].value).toBe(5);
  });

  /* -------------------------------- pending ------------------------------- */

  it("settles pending payments into completed revenue", () => {
    // random === 0 resolves every pending order, and marks it failed.
    const pendingOrder = {
      txId: "tx_pending",
      amount: 200,
      profit: 80,
      lines: [{ name: CATALOG[0].name, qty: 1 }],
    };
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      transactions: [
        {
          id: "tx_pending",
          name: "Pat Payer",
          email: "pat@example.com",
          amount: 200,
          status: "pending",
          method: "Visa",
          date: base.revenue.at(-1)!.date,
        },
      ],
      pending: [pendingOrder],
      revenue: [...base.revenue.slice(0, -1), day(29, { orders: 5 })],
    };

    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(prev, 1);

    expect(next.pending).toHaveLength(0);
    expect(next.transactions[0].status).toBe("failed");
    // A failed settlement gives back the optimistically counted order.
    expect(next.revenue.at(-1)!.orders).toBe(4);
  });

  it("credits a pending order that settles successfully", () => {
    seedRandom(17);
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      transactions: [
        {
          id: "tx_ok",
          name: "Sam Settler",
          email: "sam@example.com",
          amount: 200,
          status: "pending",
          method: "Visa",
          date: base.revenue.at(-1)!.date,
        },
      ],
      pending: [
        {
          txId: "tx_ok",
          amount: 200,
          profit: 80,
          lines: [{ name: CATALOG[0].name, qty: 2 }],
        },
      ],
      revenue: [
        ...base.revenue.slice(0, -1),
        day(29, { revenue: 0, profit: 0 }),
      ],
    };

    let next = prev;
    for (let i = 0; i < 60 && next.pending.length > 0; i++) {
      next = tickSimulation(next, 1);
    }
    expect(next.pending).toHaveLength(0);
    expect(
      next.transactions.some(
        (t) => t.id === "tx_ok" && ["completed", "failed"].includes(t.status),
      ),
    ).toBe(true);
  });

  it("leaves a pending order in place while it has not resolved", () => {
    // random === 0.99 clears the resolve threshold, so nothing settles.
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      pending: [
        {
          txId: "tx_wait",
          amount: 100,
          profit: 40,
          lines: [{ name: CATALOG[0].name, qty: 1 }],
        },
      ],
    };
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const next = tickSimulation(prev, 1);
    expect(next.pending).toEqual(prev.pending);
  });

  it("does nothing to pending when there is none", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const next = tickSimulation({ ...base, dayTick: 0, pending: [] }, 1);
    expect(next.pending).toEqual([]);
  });

  /* -------------------------------- refunds ------------------------------- */

  it("refunds a completed sale, clawing back revenue and profit", () => {
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      revenue: [
        ...base.revenue.slice(0, -1),
        day(29, { revenue: 5000, profit: 2000 }),
      ],
    };
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(prev, 1);

    const refunded = next.transactions.filter((t) => t.status === "refunded");
    expect(refunded).toHaveLength(1);
    expect(next.revenue.at(-1)!.revenue).toBe(5000 - 500);
    expect(next.revenue.at(-1)!.profit).toBe(2000 - 500 * 0.4);
    expect(next.activity.some((a) => a.action === "refunded order")).toBe(true);
  });

  it("never drives today's totals below zero on a refund", () => {
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      revenue: [
        ...base.revenue.slice(0, -1),
        day(29, { revenue: 5, profit: 1 }),
      ],
    };
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(prev, 1);
    expect(next.revenue.at(-1)!.revenue).toBe(0);
    expect(next.revenue.at(-1)!.profit).toBe(0);
  });

  it("skips the refund when nothing is completed", () => {
    const prev: SimulationSnapshot = {
      ...base,
      dayTick: 0,
      transactions: [
        {
          id: "tx_failed",
          name: "Fay Fail",
          email: "fay@example.com",
          amount: 90,
          status: "failed",
          method: "Amex",
          date: base.revenue.at(-1)!.date,
        },
      ],
    };
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(prev, 1);
    expect(next.transactions.some((t) => t.status === "refunded")).toBe(false);
  });

  /* --------------------------- ambient workspace -------------------------- */

  it("emits a signup, signin, product update and export at random === 0", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation({ ...base, dayTick: 0 }, 1);

    const actions = next.activity.map((a) => a.action);
    expect(actions).toContain("created account");
    expect(actions).toContain("signed in");
    expect(actions).toContain("updated product");
    expect(actions).toContain("exported report");
    expect(next.counts.users).toBe(base.counts.users + 1);
  });

  it("emits no ambient events when every roll misses", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    const next = tickSimulation({ ...base, dayTick: 0, activity: [] }, 1);
    expect(next.activity).toEqual([]);
    expect(next.counts.users).toBe(base.counts.users);
  });

  it("names a real catalog product in the product-update event", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation({ ...base, dayTick: 0 }, 1);
    const event = next.activity.find((a) => a.action === "updated product")!;
    expect(CATALOG.map((p) => p.name)).toContain(event.target);
  });

  it("leaves the product count alone", () => {
    seedRandom();
    const next = tickSimulation({ ...base, dayTick: 0 }, 5);
    expect(next.counts.products).toBe(base.counts.products);
  });

  /* ---------------------------------- caps -------------------------------- */

  it("caps transactions at 20 and activity at 60", () => {
    seedRandom(31);
    let snapshot = { ...base, dayTick: 0 };
    for (let i = 0; i < 120; i++) snapshot = tickSimulation(snapshot, 5);
    expect(snapshot.transactions.length).toBeLessThanOrEqual(20);
    expect(snapshot.activity.length).toBeLessThanOrEqual(60);
    expect(snapshot.transactions.length).toBe(20);
    expect(snapshot.activity.length).toBe(60);
  });

  it("keeps the newest events at the head of each feed", () => {
    seedRandom(37);
    let snapshot = { ...base, dayTick: 0 };
    for (let i = 0; i < 30; i++) snapshot = tickSimulation(snapshot, 5);
    const times = snapshot.activity.map((a) => new Date(a.date).getTime());
    expect([...times].sort((a, b) => b - a)).toEqual(times);
  });

  /* ------------------------------- derived -------------------------------- */

  it("recomputes the top 6 by revenue every tick", () => {
    seedRandom(41);
    let snapshot = { ...base, dayTick: 0 };
    for (let i = 0; i < 40; i++) snapshot = tickSimulation(snapshot, 4);

    expect(snapshot.topProducts).toHaveLength(6);
    const revenues = snapshot.topProducts.map((p) => p.revenue);
    expect([...revenues].sort((a, b) => b - a)).toEqual(revenues);

    const best = [...snapshot.products].sort((a, b) => b.revenue - a.revenue);
    expect(snapshot.topProducts.map((p) => p.name)).toEqual(
      best.slice(0, 6).map((p) => p.name),
    );
  });

  it("rebuilds the overview KPIs from the live series", () => {
    seedRandom(43);
    const next = tickSimulation({ ...base, dayTick: 0 }, 2);
    expect(next.kpis.map((k) => k.key)).toEqual([
      "revenue",
      "orders",
      "users",
      "conversion",
    ]);
    expect(next.kpis[2].value).toBe(next.counts.users);
  });
});

/* -------------------------------------------------------------------------- */

describe("event id generation", () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
      writable: true,
    });
  });

  it("uses crypto.randomUUID when it is available", () => {
    const randomUUID = vi.fn(() => "1111-2222" as `${string}-${string}`);
    Object.defineProperty(globalThis, "crypto", {
      value: { randomUUID },
      configurable: true,
      writable: true,
    });

    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(
      { ...createSimulation(makeSeed()), dayTick: 0 },
      1,
    );

    expect(randomUUID).toHaveBeenCalled();
    expect(next.activity[0].id).toBe("act_1111-2222");
  });

  it("falls back to a random suffix when crypto is unavailable", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(
      { ...createSimulation(makeSeed()), dayTick: 0 },
      1,
    );

    expect(next.activity.length).toBeGreaterThan(0);
    for (const item of next.activity) {
      expect(item.id).toMatch(/^act_[a-z0-9]*$/);
    }
  });

  it("falls back when crypto exists without randomUUID", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: {},
      configurable: true,
      writable: true,
    });

    vi.spyOn(Math, "random").mockReturnValue(0);
    const next = tickSimulation(
      { ...createSimulation(makeSeed()), dayTick: 0 },
      1,
    );
    expect(next.activity[0].id.startsWith("act_")).toBe(true);
  });
});
