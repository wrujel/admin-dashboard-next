"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { RevenueAreaChart } from "@/app/ui/charts/revenue-area-chart";
import { Panel } from "@/app/ui/widgets/panel";
import { LegendDot } from "@/app/ui/widgets/page-header";

export function LiveRevenuePanel({ className }: { className?: string }) {
  const { revenue } = useSimulator();
  return (
    <Panel
      title="Revenue & profit"
      description="Daily, last 30 days"
      className={className}
      action={
        <div className="flex items-center gap-3">
          <LegendDot color="var(--color-chart-1)" label="Revenue" />
          <LegendDot color="var(--color-chart-2)" label="Profit" />
        </div>
      }
    >
      <RevenueAreaChart data={revenue} />
    </Panel>
  );
}
