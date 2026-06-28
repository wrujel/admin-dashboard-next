import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts deterministically. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number with compact notation (e.g. 12.4k, 3.1M). */
export function formatCompact(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
    ...opts,
  }).format(value);
}

/** Format a number as USD currency. */
export function formatCurrency(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    ...opts,
  }).format(value);
}

/** Format a 0..1 (or 0..100) ratio as a signed percentage string. */
export function formatPercent(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
    ...opts,
  }).format(value);
}

/** Compact relative time, e.g. "3s", "12m", "5h", "2d", "3w". */
export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.max(1, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w}w`;
  const mo = Math.floor(days / 30);
  if (mo < 12) return `${mo}mo`;
  return `${Math.floor(days / 365)}y`;
}

/** Absolute short date, e.g. "Jun 24, 2026". */
export function formatDate(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
