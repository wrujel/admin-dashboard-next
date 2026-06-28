import type { Metadata } from "next";

import { getRevenueData } from "@/app/lib/data";
import type { RevenueRange } from "@/app/lib/types";
import { KpiCards } from "@/app/ui/overview/kpi-cards";
import { CategoryBars } from "@/app/ui/overview/category-bars";
import { RevenueAreaChart } from "@/app/ui/charts/revenue-area-chart";
import { DonutBreakdown } from "@/app/ui/charts/donut-breakdown";
import { BarBreakdown } from "@/app/ui/charts/bar-breakdown";
import { RangeToggle } from "@/app/ui/revenue/range-toggle";
import { Panel } from "@/app/ui/widgets/panel";
import { PageHeader, LegendDot } from "@/app/ui/widgets/page-header";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Revenue" };

const VALID: RevenueRange[] = ["7d", "30d", "q", "s", "y"];
const LABELS: Record<RevenueRange, string> = {
  "7d": "last 7 days",
  "30d": "last 30 days",
  q: "last quarter",
  s: "last 6 months",
  y: "last year",
};

const SHORT_REGION: Record<string, string> = {
  "North America": "N. Amer.",
  "Latin America": "LATAM",
  "Asia Pacific": "APAC",
  Europe: "Europe",
  "Middle East & Africa": "MEA",
};

export default async function RevenuePage(props: {
  searchParams: Promise<{ range?: string }>;
}) {
  const sp = await props.searchParams;
  const range: RevenueRange = VALID.includes(sp.range as RevenueRange)
    ? (sp.range as RevenueRange)
    : "30d";
  const d = await getRevenueData(range);
  const rangeLabel = LABELS[range];

  return (
    <div className="space-y-4 lg:space-y-6">
      <PageHeader
        title="Revenue"
        description={`Revenue performance · ${rangeLabel}`}
      >
        <RangeToggle value={range} />
      </PageHeader>

      <KpiCards kpis={d.kpis} />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <Panel
          title="Revenue & profit"
          description={`Trend · ${rangeLabel}`}
          className="lg:col-span-8"
          action={
            <div className="flex items-center gap-3">
              <LegendDot color="var(--color-chart-1)" label="Revenue" />
              <LegendDot color="var(--color-chart-2)" label="Profit" />
            </div>
          }
        >
          <RevenueAreaChart data={d.series} />
        </Panel>

        <Panel
          title="Revenue by channel"
          description="Share of revenue"
          className="lg:col-span-4"
        >
          <DonutBreakdown data={d.channels} centerLabel="Revenue" currency />
          <ul className="mt-4 space-y-2">
            {d.channels.map((c) => (
              <li
                key={c.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  {c.name}
                </span>
                <span className="tabular text-muted-foreground font-mono text-xs">
                  {formatCurrency(c.value)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        <CategoryBars
          data={d.categories}
          title="Revenue by category"
          description={`By revenue · ${rangeLabel}`}
          format={(n) => formatCurrency(n)}
          className="lg:col-span-6"
        />
        <Panel
          title="Revenue by region"
          description={`By revenue · ${rangeLabel}`}
          className="lg:col-span-6"
        >
          <BarBreakdown data={d.regions} currency labels={SHORT_REGION} />
        </Panel>
      </div>
    </div>
  );
}
