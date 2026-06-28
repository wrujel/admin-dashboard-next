"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/app/lib/types";
import { ChartTooltip } from "./chart-tooltip";

export function OrdersBarChart({ data }: { data: RevenuePoint[] }) {
  const recent = data.slice(-14);
  return (
    <ResponsiveContainer width="100%" height={264}>
      <BarChart
        data={recent}
        margin={{ left: -12, right: 8, top: 8, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          minTickGap={20}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
        />
        <Bar
          dataKey="orders"
          name="Orders"
          fill="var(--color-chart-2)"
          radius={[4, 4, 0, 0]}
          maxBarSize={26}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
