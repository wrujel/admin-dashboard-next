"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/app/lib/types";
import { formatCompact } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";

export function RevenueAreaChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={288}>
      <AreaChart data={data} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0.35}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0}
            />
          </linearGradient>
          <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-2)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          minTickGap={28}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          tickFormatter={(v) => formatCompact(Number(v))}
        />
        <Tooltip
          content={<ChartTooltip currency />}
          cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#fillRevenue)"
          activeDot={{ r: 3.5, strokeWidth: 0 }}
        />
        <Area
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          fill="url(#fillProfit)"
          activeDot={{ r: 3.5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
