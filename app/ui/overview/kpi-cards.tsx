"use client";

import {
  DollarSignIcon,
  PercentIcon,
  ShoppingCartIcon,
  TrendingUpIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import type { Kpi, KpiIconKey } from "@/app/lib/types";
import { StatCard } from "@/app/ui/widgets/stat-card";
import { formatCompact, formatCurrency } from "@/lib/utils";

const ICONS: Record<KpiIconKey, typeof DollarSignIcon> = {
  revenue: DollarSignIcon,
  orders: ShoppingCartIcon,
  users: UsersIcon,
  conversion: PercentIcon,
  aov: TrendingUpIcon,
  profit: WalletIcon,
};

function formatter(format: Kpi["format"]): (n: number) => string {
  switch (format) {
    case "currency":
      return (n) => formatCurrency(n);
    case "compact":
      return (n) => formatCompact(n);
    case "percent":
      return (n) =>
        new Intl.NumberFormat("en-US", {
          style: "percent",
          maximumFractionDigits: 1,
        }).format(n);
    default:
      return (n) => Math.round(n).toLocaleString();
  }
}

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k, i) => (
        <StatCard
          key={k.key}
          index={i}
          label={k.label}
          value={k.value}
          format={formatter(k.format)}
          delta={k.delta}
          icon={ICONS[k.iconKey]}
          spark={k.spark}
          accent={k.accent}
          hint={k.hint}
        />
      ))}
    </div>
  );
}
