import "server-only";
import { cache } from "react";

import { connectToDB } from "@/app/lib/utils";
import { User } from "@/app/models/user";
import { Product } from "@/app/models/product";
import * as mock from "@/app/lib/mock";
import type {
  CategoryDatum,
  DashboardData,
  Kpi,
  ProductRow,
  RevenuePoint,
  RevenueRange,
  UserRow,
} from "@/app/lib/types";

/**
 * Runs a DB query only when a connection string is configured, with a hard
 * timeout so a slow/unreachable database never blocks a render. Any failure
 * (or missing config) resolves to `fallback`.
 */
async function safe<T>(
  fn: () => Promise<T>,
  fallback: T,
  ms = 2500,
): Promise<T> {
  if (!process.env.MONGO_URI) return fallback;
  try {
    return await Promise.race([
      (async () => {
        await connectToDB();
        return await fn();
      })(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("db-timeout")), ms),
      ),
    ]);
  } catch {
    return fallback;
  }
}

const sumBy = <T>(arr: T[], k: (t: T) => number) =>
  arr.reduce((acc, t) => acc + k(t), 0);
const ratio = (now: number, prev: number) =>
  prev === 0 ? 0 : (now - prev) / prev;

function buildKpis(
  revenue: RevenuePoint[],
  userCount: number,
  productCount: number,
): Kpi[] {
  const half = Math.floor(revenue.length / 2);
  const prior = revenue.slice(0, half);
  const recent = revenue.slice(half);

  const revNow = sumBy(recent, (r) => r.revenue);
  const revPrev = sumBy(prior, (r) => r.revenue);
  const ordNow = sumBy(recent, (r) => r.orders);
  const ordPrev = sumBy(prior, (r) => r.orders);
  const visNow = sumBy(recent, (r) => r.visitors);

  const totalRevenue = sumBy(revenue, (r) => r.revenue);
  const totalOrders = sumBy(revenue, (r) => r.orders);
  const conversion = visNow === 0 ? 0 : ordNow / visNow;
  const aov = totalOrders === 0 ? 0 : totalRevenue / totalOrders;

  return [
    {
      key: "revenue",
      label: "Total Revenue",
      value: totalRevenue,
      delta: ratio(revNow, revPrev),
      format: "currency",
      spark: revenue.map((r) => r.revenue).slice(-14),
      accent: "primary",
      iconKey: "revenue",
      hint: "Last 30 days",
    },
    {
      key: "orders",
      label: "Orders",
      value: totalOrders,
      delta: ratio(ordNow, ordPrev),
      format: "number",
      spark: revenue.map((r) => r.orders).slice(-14),
      accent: "info",
      iconKey: "orders",
      hint: "Last 30 days",
    },
    {
      key: "users",
      label: "Active Users",
      value: userCount,
      delta: 0.082,
      format: "compact",
      spark: revenue.map((r) => r.visitors).slice(-14),
      accent: "chart-4",
      iconKey: "users",
      hint: `${productCount} products live`,
    },
    {
      key: "conversion",
      label: "Conversion",
      value: conversion,
      delta: ratio(ordNow / Math.max(visNow, 1), ordPrev / Math.max(visNow, 1)),
      format: "percent",
      spark: revenue.map((r) => r.orders / Math.max(r.visitors, 1)).slice(-14),
      accent: conversion >= 0.06 ? "primary" : "warning",
      iconKey: "conversion",
      hint: `AOV ${aov.toFixed(0)} USD`,
    },
  ];
}

export const getDashboardData = cache(async (): Promise<DashboardData> => {
  const revenue = mock.revenueSeries(30);

  const liveUsers = await safe(() => User.countDocuments({}).exec(), null);
  const liveProducts = await safe(
    () => Product.countDocuments({}).exec(),
    null,
  );

  const userCount = liveUsers ?? 18420;
  const productCount = liveProducts ?? 642;

  return {
    kpis: buildKpis(revenue, userCount, productCount),
    revenue,
    categories: mock.categoryBreakdown(),
    traffic: mock.trafficSources(),
    transactions: mock.transactions(7),
    topProducts: mock.topProducts(6),
    activity: mock.activity(8),
    source: liveUsers !== null ? "live" : "demo",
  };
});

/* -------------------------------- Revenue --------------------------------- */

function buildRevenueKpis(series: RevenuePoint[]): Kpi[] {
  const half = Math.floor(series.length / 2);
  const prior = series.slice(0, half);
  const recent = series.slice(half);

  const revNow = sumBy(recent, (r) => r.revenue);
  const revPrev = sumBy(prior, (r) => r.revenue);
  const profNow = sumBy(recent, (r) => r.profit);
  const profPrev = sumBy(prior, (r) => r.profit);
  const ordNow = sumBy(recent, (r) => r.orders);
  const ordPrev = sumBy(prior, (r) => r.orders);

  const totalRevenue = sumBy(series, (r) => r.revenue);
  const totalProfit = sumBy(series, (r) => r.profit);
  const totalOrders = sumBy(series, (r) => r.orders);
  const aov = totalOrders ? totalRevenue / totalOrders : 0;
  const aovNow = ordNow ? revNow / ordNow : 0;
  const aovPrev = ordPrev ? revPrev / ordPrev : 0;
  const margin = totalRevenue
    ? Math.round((totalProfit / totalRevenue) * 100)
    : 0;

  return [
    {
      key: "revenue",
      label: "Total Revenue",
      value: totalRevenue,
      delta: ratio(revNow, revPrev),
      format: "currency",
      spark: series.map((r) => r.revenue).slice(-14),
      accent: "primary",
      iconKey: "revenue",
    },
    {
      key: "profit",
      label: "Gross Profit",
      value: totalProfit,
      delta: ratio(profNow, profPrev),
      format: "currency",
      spark: series.map((r) => r.profit).slice(-14),
      accent: "info",
      iconKey: "profit",
      hint: `${margin}% margin`,
    },
    {
      key: "aov",
      label: "Avg Order Value",
      value: aov,
      delta: ratio(aovNow, aovPrev),
      format: "currency",
      spark: series
        .map((r) => (r.orders ? r.revenue / r.orders : 0))
        .slice(-14),
      accent: "chart-4",
      iconKey: "aov",
    },
    {
      key: "orders",
      label: "Orders",
      value: totalOrders,
      delta: ratio(ordNow, ordPrev),
      format: "number",
      spark: series.map((r) => r.orders).slice(-14),
      accent: "warning",
      iconKey: "orders",
    },
  ];
}

export const getRevenueData = cache(async (range: RevenueRange) => {
  const series = mock.revenueRangeSeries(range);
  const total = sumBy(series, (r) => r.revenue);

  // Scale each breakdown so its parts sum to the period's total revenue.
  const normalize = (arr: CategoryDatum[]): CategoryDatum[] => {
    const sum = arr.reduce((a, d) => a + d.value, 0) || 1;
    return arr.map((d) => ({
      ...d,
      value: Math.round((d.value / sum) * total),
    }));
  };

  return {
    range,
    series,
    kpis: buildRevenueKpis(series),
    channels: normalize(mock.revenueByChannel(range)),
    categories: normalize(mock.revenueByCategory(range)),
    regions: normalize(mock.revenueByRegion(range)),
  };
});

/* --------------------------------- Tables --------------------------------- */

interface RawUser {
  _id: unknown;
  username?: string;
  email?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  img?: string;
  createdAt?: Date;
}

function mapUser(doc: RawUser): UserRow {
  return {
    id: String(doc._id),
    name: doc.username ?? "Unknown",
    email: doc.email ?? "",
    role: doc.isAdmin ? "admin" : "viewer",
    status: doc.isActive === false ? "suspended" : "active",
    spend: 0,
    orders: 0,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    img: doc.img || undefined,
  };
}

export const getUsersData = cache(async (): Promise<UserRow[]> => {
  const live = await safe<UserRow[] | null>(async () => {
    const docs = (await User.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as RawUser[];
    return docs.map(mapUser);
  }, null);
  return live && live.length ? live : mock.users(32);
});

interface RawProduct {
  _id: unknown;
  name?: string;
  price?: number;
  stock?: number;
  img?: string;
  category?: string;
  createdAt?: Date;
}

function mapProduct(doc: RawProduct): ProductRow {
  const stock = doc.stock ?? 0;
  return {
    id: String(doc._id),
    name: doc.name ?? "Untitled",
    category: doc.category || "General",
    price: doc.price ?? 0,
    stock,
    status: stock === 0 ? "out_of_stock" : "active",
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
    img: doc.img || undefined,
  };
}

export const getProductsData = cache(async (): Promise<ProductRow[]> => {
  const live = await safe<ProductRow[] | null>(async () => {
    const docs = (await Product.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as RawProduct[];
    return docs.map(mapProduct);
  }, null);
  return live && live.length ? live : mock.products(28);
});

export const getUserById = cache(
  async (id: string): Promise<UserRow | null> => {
    if (process.env.MONGO_URI) {
      const live = await safe(async () => {
        const doc = (await User.findById(id).lean().exec()) as RawUser | null;
        return doc ? mapUser(doc) : null;
      }, null);
      if (live) return live;
    }
    return (await getUsersData()).find((u) => u.id === id) ?? null;
  },
);

export const getProductById = cache(
  async (id: string): Promise<ProductRow | null> => {
    if (process.env.MONGO_URI) {
      const live = await safe(async () => {
        const doc = (await Product.findById(id)
          .lean()
          .exec()) as RawProduct | null;
        return doc ? mapProduct(doc) : null;
      }, null);
      if (live) return live;
    }
    return (await getProductsData()).find((p) => p.id === id) ?? null;
  },
);

export const getActivityFeed = cache(async (limit = 24) =>
  mock.activity(limit),
);
