import type { Metadata } from "next";

import { getDashboardData } from "@/app/lib/data";
import { KpiCards } from "@/app/ui/overview/kpi-cards";
import { CategoryBars } from "@/app/ui/overview/category-bars";
import { RecentTransactions } from "@/app/ui/overview/recent-transactions";
import { TopProducts } from "@/app/ui/overview/top-products";
import { ActivityFeed } from "@/app/ui/overview/activity-feed";
import { RevenueAreaChart } from "@/app/ui/charts/revenue-area-chart";
import { OrdersBarChart } from "@/app/ui/charts/orders-bar-chart";
import { TrafficDonut } from "@/app/ui/charts/traffic-donut";
import { Panel } from "@/app/ui/widgets/panel";
import { PageHeader, LegendDot } from "@/app/ui/widgets/page-header";
import { Badge } from "@/app/ui/primitives/badge";
import { formatCompact } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

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

      <KpiCards kpis={d.kpis} />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <Panel
          title="Revenue & profit"
          description="Daily, last 30 days"
          className="lg:col-span-8"
          action={
            <div className="flex items-center gap-3">
              <LegendDot color="var(--color-chart-1)" label="Revenue" />
              <LegendDot color="var(--color-chart-2)" label="Profit" />
            </div>
          }
        >
          <RevenueAreaChart data={d.revenue} />
        </Panel>

        <Panel
          title="Traffic sources"
          description="Sessions by channel"
          className="lg:col-span-4"
        >
          <TrafficDonut data={d.traffic} />
          <ul className="mt-4 space-y-2">
            {d.traffic.map((t) => (
              <li
                key={t.source}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: t.color }}
                  />
                  {t.source}
                </span>
                <span className="tabular text-muted-foreground font-mono text-xs">
                  {formatCompact(t.visitors)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <Panel
          title="Orders"
          description="Units ordered, last 14 days"
          className="lg:col-span-8"
        >
          <OrdersBarChart data={d.revenue} />
        </Panel>
        <CategoryBars data={d.categories} className="lg:col-span-4" />
      </div>

      <TopProducts data={d.topProducts} />

      <div className="grid items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
        <RecentTransactions
          data={d.transactions}
          className="h-full lg:col-span-8"
        />
        <ActivityFeed data={d.activity} className="h-full lg:col-span-4" />
      </div>
    </div>
  );
}
