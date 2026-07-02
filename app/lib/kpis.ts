import type { Kpi, RevenuePoint } from "./types";

/**
 * Pure KPI math shared by the server data layer and the client-side
 * simulator, so the overview cards recompute identically as the live
 * revenue series accumulates. No server-only imports allowed here.
 */

export const sumBy = <T>(arr: T[], k: (t: T) => number) =>
  arr.reduce((acc, t) => acc + k(t), 0);

export const ratio = (now: number, prev: number) =>
  prev === 0 ? 0 : (now - prev) / prev;

export function buildOverviewKpis(
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
