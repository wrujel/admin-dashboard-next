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

export const PRODUCT_NAMES = [
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
