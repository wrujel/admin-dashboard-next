export type TransactionStatus = "completed" | "pending" | "failed" | "refunded";

export type UserRole = "admin" | "editor" | "viewer";
export type UserStatus = "active" | "invited" | "suspended";
export type ProductStatus = "active" | "draft" | "out_of_stock";
export type ActivityType = "user" | "order" | "product" | "auth" | "system";

export type KpiIconKey =
  | "revenue"
  | "orders"
  | "users"
  | "conversion"
  | "aov"
  | "profit";

export type RevenueRange = "7d" | "30d" | "q" | "s" | "y";

export interface Kpi {
  key: string;
  label: string;
  value: number;
  delta: number; // signed ratio
  format: "number" | "currency" | "percent" | "compact";
  spark: number[];
  accent: "primary" | "info" | "warning" | "negative" | "chart-4";
  iconKey: KpiIconKey;
  hint?: string;
}

export interface RevenuePoint {
  date: string; // ISO date
  label: string; // e.g. "Jun 3"
  revenue: number;
  profit: number;
  orders: number;
  visitors: number;
}

export interface CategoryDatum {
  name: string;
  value: number;
  color: string;
}

export interface TrafficDatum {
  source: string;
  visitors: number;
  color: string;
}

export interface TransactionRow {
  id: string;
  name: string;
  email: string;
  amount: number;
  status: TransactionStatus;
  method: string;
  date: string; // ISO
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  units: number;
  revenue: number;
  trend: number[];
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: string;
  action: string;
  target: string;
  date: string; // ISO
}

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  spend: number;
  orders: number;
  createdAt: string; // ISO
  img?: string;
}

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: string; // ISO
  img?: string;
}

export interface DashboardData {
  kpis: Kpi[];
  revenue: RevenuePoint[];
  categories: CategoryDatum[];
  traffic: TrafficDatum[];
  transactions: TransactionRow[];
  topProducts: TopProduct[];
  activity: ActivityItem[];
  counts: { users: number; products: number };
  source: "live" | "demo";
}
