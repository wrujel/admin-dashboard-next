"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CategoryDatum } from "@/app/lib/types";
import { formatCompact } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";

/** Vertical bar chart for a {name, value, color}[] breakdown. */
export function BarBreakdown({
  data,
  currency = false,
  labels,
  height = 268,
}: {
  data: CategoryDatum[];
  currency?: boolean;
  /** Optional short labels for the x-axis, keyed by full name (serializable). */
  labels?: Record<string, string>;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: -8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          vertical={false}
        />
        <XAxis
          dataKey="name"
          interval={0}
          tickLine={false}
          axisLine={false}
          tickFormatter={labels ? (v: string) => labels[v] ?? v : undefined}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => formatCompact(Number(v))}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip
          content={<ChartTooltip currency={currency} />}
          cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
        />
        <Bar
          dataKey="value"
          name={currency ? "Revenue" : "Value"}
          radius={[4, 4, 0, 0]}
          maxBarSize={52}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
