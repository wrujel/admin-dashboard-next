"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { CategoryDatum } from "@/app/lib/types";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";

export function DonutBreakdown({
  data,
  centerLabel,
  currency = false,
}: {
  data: CategoryDatum[];
  centerLabel: string;
  currency?: boolean;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Tooltip
            content={<ChartTooltip currency={currency} />}
            cursor={false}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-muted-foreground text-xs">{centerLabel}</span>
        <span className="tabular font-mono text-xl font-semibold">
          {currency ? formatCurrency(total) : formatCompact(total)}
        </span>
      </div>
    </div>
  );
}
