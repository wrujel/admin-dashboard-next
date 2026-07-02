import type {
  ActivityItem,
  CategoryDatum,
  Kpi,
  RevenuePoint,
  TopProduct,
  TrafficDatum,
  TransactionRow,
  TransactionStatus,
} from "./types";
import {
  CATALOG,
  FIRST_NAMES,
  LAST_NAMES,
  PAYMENT_METHODS,
  type CatalogItem,
} from "./fixtures";
import { buildOverviewKpis } from "./kpis";
import { mulberry32 } from "./prng";

/**
 * Event-driven ecommerce simulation. Each tick plays out a slice of store
 * life — visitors arrive through traffic channels, a fraction convert into
 * orders picked from the product catalog, pending payments settle, the odd
 * order gets refunded, users sign up — and every dashboard variable (revenue,
 * profit, orders, visitors, conversion, AOV, traffic split, category units,
 * top products, transactions, activity) derives from that one event stream.
 *
 * Seeding is deterministic (same output during SSR and hydration); ticks run
 * only after mount, so Math.random / crypto.randomUUID are safe there.
 */

/* --------------------------------- Types ---------------------------------- */

export interface SimulationSeed {
  kpis: Kpi[];
  revenue: RevenuePoint[];
  categories: CategoryDatum[];
  traffic: TrafficDatum[];
  topProducts: TopProduct[];
  transactions: TransactionRow[];
  activity: ActivityItem[];
  counts: { users: number; products: number };
}

/** A catalog item plus its running sales tally. */
export interface ProductStat extends CatalogItem {
  id: string;
  units: number;
  revenue: number;
  trend: number[];
}

/** An order awaiting payment settlement; credited only once it completes. */
interface PendingOrder {
  txId: string;
  amount: number;
  profit: number;
  lines: { name: string; qty: number }[];
}

export interface SimulationSnapshot {
  kpis: Kpi[];
  /** Daily series; the last point is "today" and accumulates live. */
  revenue: RevenuePoint[];
  categories: CategoryDatum[];
  traffic: TrafficDatum[];
  /** Full catalog tallies; `topProducts` is the live top slice. */
  products: ProductStat[];
  topProducts: TopProduct[];
  transactions: TransactionRow[];
  activity: ActivityItem[];
  counts: { users: number; products: number };
  pending: PendingOrder[];
  tick: number;
  /** Progress through the current simulated day (rolls at DAY_TICKS). */
  dayTick: number;
}

/* -------------------------------- Tuning ---------------------------------- */

const TX_CAP = 20;
const ACTIVITY_CAP = 60;
const TOP_PRODUCTS = 6;

/**
 * The simulation is a time-lapse: one simulated day passes every DAY_TICKS
 * ticks (faster at higher speeds). On rollover the 30-day window slides —
 * a new "today" starts at zero and the oldest day drops off — which keeps
 * every windowed metric in steady state with the seeded scale.
 */
const DAY_TICKS = 60;

/** Average event rates per 1× tick — the knobs that shape the simulation. */
const RATES = {
  /** Poisson mean of visitor arrivals. */
  visitors: 4.2,
  /** Chance an arriving visitor places an order. */
  conversion: 0.11,
  /** Chance per tick that each pending payment settles. */
  pendingResolve: 0.16,
  /** Of settled payments, the share that fail instead of completing. */
  pendingFail: 0.18,
  /** Chance per tick that a recent completed order is refunded. */
  refund: 0.035,
  signup: 0.09,
  signin: 0.1,
  productUpdate: 0.04,
  reportExport: 0.008,
};

/** Weighted order outcome at checkout time. */
const CHECKOUT: { status: TransactionStatus; weight: number }[] = [
  { status: "completed", weight: 0.78 },
  { status: "pending", weight: 0.16 },
  { status: "failed", weight: 0.06 },
];

/* -------------------------------- Helpers --------------------------------- */

const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const round2 = (n: number) => Math.round(n * 100) / 100;

function uid(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}`;
}

function person() {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  return {
    name: `${first} ${last}`,
    email: `${first}.${last}`.toLowerCase() + "@example.com",
  };
}

const orderNo = () => `#${10000 + Math.floor(Math.random() * 89999)}`;

/** Knuth's Poisson sampler — how many events happen this tick. */
function poisson(lambda: number): number {
  const limit = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > limit);
  return k - 1;
}

function weightedIndex(weights: number[]): number {
  const total = weights.reduce((a, w) => a + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return i;
  }
  return weights.length - 1;
}

function activityEvent(
  type: ActivityItem["type"],
  actor: string,
  action: string,
  target: string,
  date: string,
): ActivityItem {
  return { id: uid("act"), type, actor, action, target, date };
}

/* -------------------------------- Seeding --------------------------------- */

const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Build the initial snapshot from the server-loaded data. Top products keep
 * their server numbers; the rest of the catalog gets a deterministic
 * long-tail baseline strictly below the leaders, so the initial top-6
 * ranking matches the server-rendered markup exactly.
 */
export function createSimulation(seed: SimulationSeed): SimulationSnapshot {
  const r = mulberry32(0x51a1e5);
  const seededByName = new Map(seed.topProducts.map((p) => [p.name, p]));
  const minRevenue = Math.min(...seed.topProducts.map((p) => p.revenue));

  const products: ProductStat[] = CATALOG.map((entry) => {
    const seeded = seededByName.get(entry.name);
    if (seeded) {
      return {
        ...entry,
        id: seeded.id,
        units: seeded.units,
        revenue: seeded.revenue,
        trend: [...seeded.trend],
      };
    }
    const revenue = Math.round(minRevenue * (0.2 + r() * 0.55));
    const units = Math.max(1, Math.floor(revenue / entry.price));
    return {
      ...entry,
      id: `prod_${slug(entry.name)}`,
      units,
      revenue: Math.round(units * entry.price * (0.94 + r() * 0.06)),
      trend: Array.from({ length: 12 }, () => 8 + Math.floor(r() * 30)),
    };
  });

  return {
    kpis: seed.kpis,
    revenue: seed.revenue,
    categories: seed.categories,
    traffic: seed.traffic,
    products,
    topProducts: seed.topProducts,
    transactions: seed.transactions,
    activity: seed.activity,
    counts: seed.counts,
    pending: [],
    tick: 0,
    // The seeded "today" already holds a full day's numbers, so start near
    // the end of the day — it tops up briefly, then a fresh day begins.
    dayTick: Math.round(DAY_TICKS * 0.9),
  };
}

/** Fresh zeroed series point for the day after `prev`. */
function nextDay(prev: RevenuePoint): RevenuePoint {
  const d = new Date(new Date(prev.date).getTime() + 86_400_000);
  return {
    date: d.toISOString(),
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    revenue: 0,
    profit: 0,
    orders: 0,
    visitors: 0,
  };
}

/* --------------------------------- Tick ----------------------------------- */

/**
 * Advance the simulation by one tick. `intensity` scales event volume
 * (the UI's speed multiplier). Pure with respect to `prev` — always returns
 * a fresh snapshot so React re-renders cleanly.
 */
export function tickSimulation(
  prev: SimulationSnapshot,
  intensity = 1,
): SimulationSnapshot {
  const now = new Date().toISOString();

  const traffic = prev.traffic.map((t) => ({ ...t }));
  const categories = prev.categories.map((c) => ({ ...c }));
  let products = prev.products.map((p) => ({ ...p }));

  // Time-lapse day rollover: slide the 30-day window forward.
  let dayTick = prev.dayTick + intensity;
  let today: RevenuePoint;
  let revenue: RevenuePoint[];
  if (dayTick >= DAY_TICKS) {
    dayTick = 0;
    today = nextDay(prev.revenue[prev.revenue.length - 1]);
    revenue = [...prev.revenue.slice(1), today];
    products = products.map((p) => ({
      ...p,
      trend: [...p.trend.slice(1), 0],
    }));
  } else {
    today = { ...prev.revenue[prev.revenue.length - 1] };
    revenue = [...prev.revenue.slice(0, -1), today];
  }
  const counts = { ...prev.counts };
  let transactions = [...prev.transactions];
  let activity = [...prev.activity];
  let pending = [...prev.pending];

  const productWeights = products.map((p) => p.weight);
  const byName = new Map(products.map((p) => [p.name, p]));

  /** Credit a (now completed) order's lines to every derived tally. */
  const credit = (
    lines: { name: string; qty: number }[],
    amount: number,
    profit: number,
  ) => {
    today.revenue = round2(today.revenue + amount);
    today.profit = round2(today.profit + profit);
    for (const line of lines) {
      const product = byName.get(line.name);
      if (!product) continue;
      product.units += line.qty;
      product.revenue = Math.round(product.revenue + product.price * line.qty);
      const trend = [...product.trend];
      trend[trend.length - 1] += line.qty;
      product.trend = trend;
      const category = categories.find((c) => c.name === product.category);
      if (category) category.value += line.qty;
    }
  };

  /* --- Visitors arrive, attributed to channels by their current share. --- */
  const arrivals = poisson(RATES.visitors * intensity);
  const trafficWeights = traffic.map((t) => t.visitors);
  for (let i = 0; i < arrivals; i++) {
    traffic[weightedIndex(trafficWeights)].visitors += 1;
  }
  today.visitors += arrivals;

  /* ------------------- Some visitors convert into orders. ------------------ */
  for (let i = 0; i < arrivals; i++) {
    if (Math.random() >= RATES.conversion) continue;

    // Basket: 1–3 distinct catalog items, popularity-weighted.
    const lineCount =
      1 + (Math.random() < 0.32 ? 1 : 0) + (Math.random() < 0.12 ? 1 : 0);
    const chosen = new Set<number>();
    while (chosen.size < lineCount) chosen.add(weightedIndex(productWeights));
    const lines = [...chosen].map((idx) => ({
      name: products[idx].name,
      qty: Math.random() < 0.22 ? 2 : 1,
      price: products[idx].price,
      margin: products[idx].margin,
    }));

    const amount = round2(lines.reduce((sum, l) => sum + l.price * l.qty, 0));
    const profit = round2(
      lines.reduce((sum, l) => sum + l.price * l.margin * l.qty, 0),
    );
    const status =
      CHECKOUT[weightedIndex(CHECKOUT.map((c) => c.weight))].status;

    const buyer = person();
    transactions = [
      {
        id: uid("tx"),
        name: buyer.name,
        email: buyer.email,
        amount,
        status,
        method: pick(PAYMENT_METHODS),
        date: now,
      },
      ...transactions,
    ];
    activity = [
      activityEvent("order", buyer.name, "placed order", orderNo(), now),
      ...activity,
    ];

    if (status === "failed") continue;
    today.orders += 1;
    if (status === "pending") {
      pending.push({
        txId: transactions[0].id,
        amount,
        profit,
        lines: lines.map(({ name, qty }) => ({ name, qty })),
      });
      continue;
    }
    credit(lines, amount, profit);
  }

  /* ----------------- Pending payments settle (or bounce). ------------------ */
  if (pending.length > 0) {
    const remaining: PendingOrder[] = [];
    for (const order of pending) {
      if (Math.random() >= RATES.pendingResolve * intensity) {
        remaining.push(order);
        continue;
      }
      const failed = Math.random() < RATES.pendingFail;
      transactions = transactions.map((t) =>
        t.id === order.txId
          ? { ...t, status: failed ? "failed" : "completed" }
          : t,
      );
      if (failed) {
        today.orders = Math.max(0, today.orders - 1);
      } else {
        credit(order.lines, order.amount, order.profit);
      }
    }
    pending = remaining;
  }

  /* ------------------ Occasionally a sale gets refunded. ------------------- */
  if (Math.random() < RATES.refund * intensity) {
    const target = transactions.find((t) => t.status === "completed");
    if (target) {
      transactions = transactions.map((t) =>
        t.id === target.id ? { ...t, status: "refunded" as const } : t,
      );
      today.revenue = round2(Math.max(0, today.revenue - target.amount));
      today.profit = round2(Math.max(0, today.profit - target.amount * 0.4));
      activity = [
        activityEvent("order", target.name, "refunded order", orderNo(), now),
        ...activity,
      ];
    }
  }

  /* ----------------------- Ambient workspace events. ----------------------- */
  if (Math.random() < RATES.signup * intensity) {
    counts.users += 1;
    activity = [
      activityEvent(
        "user",
        person().name,
        "created account",
        "via Google",
        now,
      ),
      ...activity,
    ];
  }
  if (Math.random() < RATES.signin * intensity) {
    activity = [
      activityEvent(
        "auth",
        person().name,
        "signed in",
        "from a new device",
        now,
      ),
      ...activity,
    ];
  }
  if (Math.random() < RATES.productUpdate * intensity) {
    activity = [
      activityEvent(
        "product",
        person().name,
        "updated product",
        pick(CATALOG).name,
        now,
      ),
      ...activity,
    ];
  }
  if (Math.random() < RATES.reportExport * intensity) {
    activity = [
      activityEvent(
        "system",
        person().name,
        "exported report",
        "revenue_q2.csv",
        now,
      ),
      ...activity,
    ];
  }

  /* ------------------------- Derived measurements. -------------------------- */
  const topProducts = [...products]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, TOP_PRODUCTS);

  return {
    kpis: buildOverviewKpis(revenue, counts.users, counts.products),
    revenue,
    categories,
    traffic,
    products,
    topProducts,
    transactions: transactions.slice(0, TX_CAP),
    activity: activity.slice(0, ACTIVITY_CAP),
    counts,
    pending,
    tick: prev.tick + 1,
    dayTick,
  };
}
