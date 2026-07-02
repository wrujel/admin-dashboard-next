"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { TrafficDonut } from "@/app/ui/charts/traffic-donut";
import { Panel } from "@/app/ui/widgets/panel";
import { formatCompact } from "@/lib/utils";

export function LiveTrafficPanel({ className }: { className?: string }) {
  const { traffic } = useSimulator();
  return (
    <Panel
      title="Traffic sources"
      description="Sessions by channel"
      className={className}
    >
      <TrafficDonut data={traffic} />
      <ul className="mt-4 space-y-2">
        {traffic.map((t) => (
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
  );
}
