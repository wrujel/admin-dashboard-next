import type { ActivityType, TransactionStatus } from "./types";

/**
 * Shared, framework-agnostic data pools used by the mock generators, the
 * client-side simulator, and the product seed script. Pure data only — safe to
 * import on the server, the client, or a standalone Node script.
 */

export const FIRST_NAMES = [
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

export const LAST_NAMES = [
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

export const CATEGORIES = [
  "Phones",
  "Computers",
  "Audio",
  "Wearables",
  "TVs",
  "Accessories",
];

export interface CatalogItem {
  name: string;
  category: string;
  /** Unit price in USD — transaction amounts derive from this. */
  price: number;
  /** Gross margin ratio used to derive profit from revenue. */
  margin: number;
  /** Relative popularity — how often the simulator sells this item. */
  weight: number;
}

/**
 * The store's product catalog. Every simulated sale picks from this list, so
 * transactions, category units, top-product revenue and profit stay coherent
 * (amount = Σ price × qty, profit = Σ price × margin × qty).
 */
export const CATALOG: CatalogItem[] = [
  {
    name: "Aurora Phone X",
    category: "Phones",
    price: 999,
    margin: 0.38,
    weight: 6,
  },
  {
    name: "Nimbus Laptop 14",
    category: "Computers",
    price: 1299,
    margin: 0.3,
    weight: 3,
  },
  {
    name: "Pulse Buds Pro",
    category: "Audio",
    price: 179,
    margin: 0.55,
    weight: 10,
  },
  {
    name: "Vertex Watch S",
    category: "Wearables",
    price: 399,
    margin: 0.44,
    weight: 6,
  },
  { name: "Lumen TV 55", category: "TVs", price: 799, margin: 0.28, weight: 3 },
  {
    name: "Glide Mouse",
    category: "Accessories",
    price: 49,
    margin: 0.6,
    weight: 12,
  },
  {
    name: "Echo Speaker",
    category: "Audio",
    price: 129,
    margin: 0.5,
    weight: 7,
  },
  {
    name: "Forge Keyboard",
    category: "Accessories",
    price: 139,
    margin: 0.55,
    weight: 9,
  },
  {
    name: "Orbit Tablet",
    category: "Computers",
    price: 549,
    margin: 0.34,
    weight: 4,
  },
  {
    name: "Drift Headset",
    category: "Audio",
    price: 249,
    margin: 0.48,
    weight: 6,
  },
  {
    name: "Spark Charger",
    category: "Accessories",
    price: 29,
    margin: 0.62,
    weight: 14,
  },
  {
    name: "Halo Monitor 27",
    category: "Computers",
    price: 429,
    margin: 0.35,
    weight: 4,
  },
  {
    name: "Nova Phone Mini",
    category: "Phones",
    price: 699,
    margin: 0.36,
    weight: 5,
  },
  {
    name: "Quartz Laptop Pro",
    category: "Computers",
    price: 1899,
    margin: 0.32,
    weight: 2,
  },
  {
    name: "Zen Earbuds",
    category: "Audio",
    price: 99,
    margin: 0.52,
    weight: 9,
  },
  {
    name: "Flux Band",
    category: "Wearables",
    price: 129,
    margin: 0.5,
    weight: 8,
  },
];

export const PRODUCT_NAMES = CATALOG.map((p) => p.name);

export const PAYMENT_METHODS = [
  "Visa",
  "Mastercard",
  "PayPal",
  "Apple Pay",
  "Amex",
];

export const PRODUCT_COLORS = [
  "Graphite",
  "Silver",
  "Midnight",
  "Rose Gold",
  "Emerald",
  "Sky",
  "Onyx",
];

export const PRODUCT_SIZES = ["S", "M", "L", "XL", "One size"];

/** Weighted pool — "completed" is most common. */
export const TX_STATUS_POOL: TransactionStatus[] = [
  "completed",
  "completed",
  "completed",
  "pending",
  "failed",
  "refunded",
];

export const ACTIVITY_TEMPLATES: {
  type: ActivityType;
  action: string;
  target: (rand: () => number) => string;
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
