import type {
  ActivityItem,
  ActivityType,
  CategoryDatum,
  ProductRow,
  ProductStatus,
  RevenuePoint,
  RevenueRange,
  TopProduct,
  TrafficDatum,
  TransactionRow,
  TransactionStatus,
  UserRole,
  UserRow,
  UserStatus,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Deterministic PRNG so the demo data is stable across renders/builds        */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(0xc0ffee);
const rand = (min: number, max: number) => min + rng() * (max - min);
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));
const pick = <T>(arr: readonly T[]) => arr[randInt(0, arr.length - 1)];
const id = (p: string, i: number) =>
  `${p}_${(i + 1).toString().padStart(4, "0")}`;

const FIRST = [
  "Ava",
  "Liam",
  "Noah",
  "Mia",
  "Ethan",
  "Sofia",
  "Lucas",
  "Isla",
  "Mateo",
  "Zoe",
  "Aria",
  "Leo",
  "Nina",
  "Kai",
  "Ruby",
  "Omar",
  "Yuki",
  "Elena",
  "Hugo",
  "Maya",
  "Theo",
  "Ivy",
  "Cole",
  "Lena",
];
const LAST = [
  "Carter",
  "Nguyen",
  "Patel",
  "Kim",
  "Silva",
  "Rossi",
  "Haddad",
  "Ono",
  "Mensah",
  "Novak",
  "Khan",
  "Reyes",
  "Wagner",
  "Costa",
  "Adams",
  "Lindqvist",
];

const CATEGORIES = [
  "Phones",
  "Computers",
  "Audio",
  "Wearables",
  "TVs",
  "Accessories",
] as const;

const PRODUCT_NAMES = [
  "Aurora Phone X",
  "Nimbus Laptop 14",
  "Pulse Buds Pro",
  "Vertex Watch S",
  "Lumen TV 55",
  "Glide Mouse",
  "Echo Speaker",
  "Forge Keyboard",
  "Orbit Tablet",
  "Drift Headset",
  "Spark Charger",
  "Halo Monitor 27",
  "Nova Phone Mini",
  "Quartz Laptop Pro",
  "Zen Earbuds",
  "Flux Band",
];

const METHODS = ["Visa", "Mastercard", "PayPal", "Apple Pay", "Amex"];
const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-info)",
];

function fullName() {
  return `${pick(FIRST)} ${pick(LAST)}`;
}
function emailFor(name: string, i: number) {
  return `${name.toLowerCase().replace(/[^a-z]/g, ".")}${i}@example.com`;
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

/* -------------------------------------------------------------------------- */
/*  Generators                                                                 */
/* -------------------------------------------------------------------------- */

export function revenueSeries(days = 30): RevenuePoint[] {
  const points: RevenuePoint[] = [];
  let base = 8200;
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const wave = Math.sin((days - i) / 3.2) * 1400;
    const drift = (days - i) * 90;
    base = Math.max(3200, base + rand(-700, 760));
    const revenue = Math.round(
      base + wave + drift - (weekend ? 1500 : 0) + rand(-400, 400),
    );
    const orders = Math.round(revenue / rand(58, 74));
    points.push({
      date: d.toISOString(),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      revenue,
      profit: Math.round(revenue * rand(0.32, 0.46)),
      orders,
      visitors: Math.round(orders * rand(11, 18)),
    });
  }
  return points;
}

export function sparkFrom(series: number[], n = 14): number[] {
  return series.slice(-n);
}

export function categoryBreakdown(): CategoryDatum[] {
  return CATEGORIES.map((name, i) => ({
    name,
    value: randInt(120, 980),
    color: CHART_COLORS[i % CHART_COLORS.length],
  })).sort((a, b) => b.value - a.value);
}

export function trafficSources(): TrafficDatum[] {
  const sources = ["Organic", "Direct", "Referral", "Social", "Email"];
  return sources.map((source, i) => ({
    source,
    visitors: randInt(800, 6400),
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

const TX_STATUSES: TransactionStatus[] = [
  "completed",
  "completed",
  "completed",
  "pending",
  "failed",
  "refunded",
];

export function transactions(n = 8): TransactionRow[] {
  return Array.from({ length: n }, (_, i) => {
    const name = fullName();
    return {
      id: id("tx", i),
      name,
      email: emailFor(name, i),
      amount: Math.round(rand(40, 2400) * 100) / 100,
      status: pick(TX_STATUSES),
      method: pick(METHODS),
      date: daysAgo(randInt(0, 6)).toISOString(),
    };
  });
}

export function topProducts(n = 6): TopProduct[] {
  return Array.from({ length: n }, (_, i) => {
    const units = randInt(120, 1900);
    return {
      id: id("prod", i),
      name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      category: pick(CATEGORIES),
      units,
      revenue: Math.round(units * rand(80, 420)),
      trend: Array.from({ length: 12 }, () => randInt(20, 100)),
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

const ACTIVITY_TEMPLATES: {
  type: ActivityType;
  action: string;
  target: (r: () => number) => string;
}[] = [
  {
    type: "order",
    action: "placed order",
    target: (r) => `#${10000 + Math.floor(r() * 89999)}`,
  },
  { type: "user", action: "created account", target: () => "via Google" },
  {
    type: "product",
    action: "updated product",
    target: (r) => PRODUCT_NAMES[Math.floor(r() * PRODUCT_NAMES.length)],
  },
  { type: "auth", action: "signed in", target: () => "from a new device" },
  { type: "system", action: "exported report", target: () => "revenue_q2.csv" },
  {
    type: "order",
    action: "refunded order",
    target: (r) => `#${10000 + Math.floor(r() * 89999)}`,
  },
];

/**
 * Deterministic activity feed so the dashboard panel, the activity page and the
 * notification popover all show the same events. `activity(8)` is a stable
 * prefix of `activity(30)`, ordered most-recent first.
 */
export function activity(n = 8): ActivityItem[] {
  const r = mulberry32(0xac71);
  const now = Date.now();
  let minutesAgo = 0;
  return Array.from({ length: n }, (_, i) => {
    const tpl = ACTIVITY_TEMPLATES[Math.floor(r() * ACTIVITY_TEMPLATES.length)];
    const actor = `${FIRST[Math.floor(r() * FIRST.length)]} ${
      LAST[Math.floor(r() * LAST.length)]
    }`;
    minutesAgo += 2 + Math.floor(r() * 85);
    return {
      id: id("act", i),
      type: tpl.type,
      actor,
      action: tpl.action,
      target: tpl.target(r),
      date: new Date(now - minutesAgo * 60000).toISOString(),
    };
  });
}

const ROLES: UserRole[] = ["admin", "editor", "viewer", "viewer", "viewer"];
const USER_STATUS: UserStatus[] = [
  "active",
  "active",
  "active",
  "invited",
  "suspended",
];

export function users(n = 32): UserRow[] {
  return Array.from({ length: n }, (_, i) => {
    const name = fullName();
    const orders = randInt(0, 120);
    return {
      id: id("usr", i),
      name,
      email: emailFor(name, i),
      role: pick(ROLES),
      status: pick(USER_STATUS),
      orders,
      spend: Math.round(orders * rand(45, 260)),
      createdAt: daysAgo(randInt(1, 420)).toISOString(),
    };
  });
}

const PRODUCT_STATUS: ProductStatus[] = [
  "active",
  "active",
  "active",
  "draft",
  "out_of_stock",
];

export function products(n = 28): ProductRow[] {
  return Array.from({ length: n }, (_, i) => {
    const stock = randInt(0, 540);
    return {
      id: id("prd", i),
      name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]}${i >= PRODUCT_NAMES.length ? " v2" : ""}`,
      category: pick(CATEGORIES),
      price: Math.round(rand(9, 1899) * 100) / 100,
      stock,
      status: stock === 0 ? "out_of_stock" : pick(PRODUCT_STATUS),
      createdAt: daysAgo(randInt(1, 360)).toISOString(),
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Revenue analytics — parameterized by time range                            */
/* -------------------------------------------------------------------------- */

interface RangeConfig {
  points: number;
  stepDays: number;
  unit: "day" | "month";
  days: number;
}

const RANGE_CFG: Record<RevenueRange, RangeConfig> = {
  "7d": { points: 7, stepDays: 1, unit: "day", days: 7 },
  "30d": { points: 30, stepDays: 1, unit: "day", days: 30 },
  q: { points: 13, stepDays: 7, unit: "day", days: 91 },
  s: { points: 26, stepDays: 7, unit: "day", days: 182 },
  y: { points: 12, stepDays: 30, unit: "month", days: 365 },
};

const RANGE_SEED: Record<RevenueRange, number> = {
  "7d": 0x7d,
  "30d": 0x30d,
  q: 0x511,
  s: 0x522,
  y: 0x533,
};

/** Revenue time series whose granularity adapts to the selected range. */
export function revenueRangeSeries(range: RevenueRange): RevenuePoint[] {
  const cfg = RANGE_CFG[range];
  const r = mulberry32(RANGE_SEED[range]);
  const points: RevenuePoint[] = [];
  let daily = 7800;

  for (let i = cfg.points - 1; i >= 0; i--) {
    const date = daysAgo(i * cfg.stepDays);
    daily = Math.max(3600, daily + (r() * 2 - 1) * 620 + 24);
    const wave = Math.sin((cfg.points - i) / 3) * 1200;
    const perDay = daily + wave;
    const revenue = Math.round(perDay * cfg.stepDays * (0.9 + r() * 0.2));
    const orders = Math.round(revenue / (60 + r() * 16));
    points.push({
      date: date.toISOString(),
      label:
        cfg.unit === "month"
          ? date.toLocaleDateString("en-US", { month: "short" })
          : date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
      revenue,
      profit: Math.round(revenue * (0.34 + r() * 0.12)),
      orders,
      visitors: Math.round(orders * (12 + r() * 6)),
    });
  }
  return points;
}

function scaledBreakdown(
  range: RevenueRange,
  seed: number,
  items: string[][],
  perDay: number[],
): CategoryDatum[] {
  const r = mulberry32(seed + RANGE_CFG[range].days);
  const factor = RANGE_CFG[range].days;
  return items
    .map(([name, color]) => ({
      name,
      color,
      value: Math.round((perDay[0] + r() * (perDay[1] - perDay[0])) * factor),
    }))
    .sort((a, b) => b.value - a.value);
}

export function revenueByChannel(range: RevenueRange): CategoryDatum[] {
  return scaledBreakdown(
    range,
    0xc14,
    [
      ["Online store", CHART_COLORS[0]],
      ["Marketplace", CHART_COLORS[1]],
      ["Retail / POS", CHART_COLORS[2]],
      ["Wholesale", CHART_COLORS[3]],
      ["Social", CHART_COLORS[5]],
    ],
    [180, 760],
  );
}

export function revenueByCategory(range: RevenueRange): CategoryDatum[] {
  return scaledBreakdown(
    range,
    0xca7,
    CATEGORIES.map((c, i) => [c, CHART_COLORS[i % CHART_COLORS.length]]),
    [90, 540],
  );
}

export function revenueByRegion(range: RevenueRange): CategoryDatum[] {
  return scaledBreakdown(
    range,
    0xab9,
    [
      ["North America", CHART_COLORS[0]],
      ["Europe", CHART_COLORS[1]],
      ["Asia Pacific", CHART_COLORS[2]],
      ["Latin America", CHART_COLORS[3]],
      ["Middle East & Africa", CHART_COLORS[4]],
    ],
    [120, 700],
  );
}
