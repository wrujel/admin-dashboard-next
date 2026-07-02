"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { OrdersBarChart } from "@/app/ui/charts/orders-bar-chart";
import { Panel } from "@/app/ui/widgets/panel";

export function LiveOrdersPanel({ className }: { className?: string }) {
  const { revenue } = useSimulator();
  return (
    <Panel
      title="Orders"
      description="Units ordered, last 14 days"
      className={className}
    >
      <OrdersBarChart data={revenue} />
    </Panel>
  );
}
