import { Panel } from "@/app/ui/widgets/panel";
import { Sparkline } from "@/app/ui/widgets/sparkline";
import type { TopProduct } from "@/app/lib/types";
import { formatCompact, formatCurrency } from "@/lib/utils";

export function TopProducts({ data }: { data: TopProduct[] }) {
  return (
    <Panel title="Top products" description="Ranked by revenue" noPadding>
      <div className="divide-y">
        {data.map((p, i) => (
          <div key={p.id} className="flex items-center gap-4 px-4 py-3">
            <span className="text-muted-foreground w-4 shrink-0 text-center font-mono text-xs">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-muted-foreground text-xs">{p.category}</p>
            </div>
            <span className="tabular text-muted-foreground hidden w-24 text-right font-mono text-xs sm:block">
              {formatCompact(p.units)} units
            </span>
            <div className="hidden w-24 md:block">
              <Sparkline data={p.trend} className="h-7" />
            </div>
            <span className="tabular w-24 text-right font-mono text-sm font-medium">
              {formatCurrency(p.revenue)}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
