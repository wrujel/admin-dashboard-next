import type { Metadata } from "next";

import { getDashboardData } from "@/app/lib/data";
import { LiveKpiCards } from "@/app/ui/overview/live-kpi-cards";
import { LiveRevenuePanel } from "@/app/ui/overview/live-revenue-panel";
import { LiveTrafficPanel } from "@/app/ui/overview/live-traffic-panel";
import { LiveOrdersPanel } from "@/app/ui/overview/live-orders-panel";
import { LiveCategoryBars } from "@/app/ui/overview/live-category-bars";
import { LiveTopProducts } from "@/app/ui/overview/live-top-products";
import { LiveTransactions } from "@/app/ui/overview/live-transactions";
import { LiveActivity } from "@/app/ui/overview/live-activity";
import { PageHeader } from "@/app/ui/widgets/page-header";
import { Badge } from "@/app/ui/primitives/badge";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Every panel below reads from the SimulatorProvider (seeded server-side in
 * the layout), so the whole overview — KPIs, charts, breakdowns, feeds —
 * advances together on each simulation tick.
 */
export default async function DashboardPage() {
  const d = await getDashboardData();

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Overview"
        description="Store performance across the last 30 days."
      >
        <Badge variant={d.source === "live" ? "positive" : "secondary"}>
          {d.source === "live" ? "Live data" : "Demo data"}
        </Badge>
      </PageHeader>

      <LiveKpiCards />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <LiveRevenuePanel className="lg:col-span-8" />
        <LiveTrafficPanel className="lg:col-span-4" />
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <LiveOrdersPanel className="lg:col-span-8" />
        <LiveCategoryBars className="lg:col-span-4" />
      </div>

      <LiveTopProducts />

      <div className="grid items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
        <LiveTransactions className="h-full lg:col-span-8" />
        <LiveActivity className="h-full lg:col-span-4" />
      </div>
    </div>
  );
}
