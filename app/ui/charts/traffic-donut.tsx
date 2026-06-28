"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { TrafficDatum } from "@/app/lib/types";
import { formatCompact } from "@/lib/utils";
import { ChartTooltip } from "./chart-tooltip";

export function TrafficDonut({ data }: { data: TrafficDatum[] }) {
  const total = data.reduce((acc, d) => acc + d.visitors, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Tooltip content={<ChartTooltip />} cursor={false} />
          <Pie
            data={data}
            dataKey="visitors"
            nameKey="source"
            innerRadius={62}
            outerRadius={88}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.source} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-muted-foreground text-xs">Visitors</span>
        <span className="tabular font-mono text-xl font-semibold">
          {formatCompact(total)}
        </span>
      </div>
    </div>
  );
}
