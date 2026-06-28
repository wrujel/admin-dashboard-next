import type { CategoryDatum } from "@/app/lib/types";
import { Panel } from "@/app/ui/widgets/panel";
import { formatCompact } from "@/lib/utils";

export function CategoryBars({
  data,
  title = "Sales by category",
  description = "Units sold · last 30 days",
  format = (n) => formatCompact(n),
  className,
}: {
  data: CategoryDatum[];
  title?: string;
  description?: string;
  format?: (n: number) => string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <Panel title={title} description={description} className={className}>
      <ul className="space-y-3.5">
        {data.map((d) => (
          <li key={d.name} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-[3px]"
                  style={{ background: d.color }}
                />
                <span className="truncate">{d.name}</span>
              </span>
              <span className="tabular text-muted-foreground shrink-0 font-mono text-xs">
                {format(d.value)} · {Math.round((d.value / total) * 100)}%
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(d.value / max) * 100}%`,
                  background: d.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
