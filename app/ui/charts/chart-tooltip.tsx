"use client";

import { cn, formatCurrency } from "@/lib/utils";

interface TooltipPayloadItem {
  name?: string;
  dataKey?: string | number;
  value?: number;
  color?: string;
  stroke?: string;
  payload?: Record<string, unknown>;
}

export function ChartTooltip({
  active,
  payload,
  label,
  currency = false,
  className,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  currency?: boolean;
  className?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "bg-popover/95 min-w-36 rounded-lg border p-2.5 text-xs shadow-md backdrop-blur-sm",
        className,
      )}
    >
      {label && <p className="mb-1.5 font-medium">{label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: p.color ?? p.stroke }}
            />
            <span className="text-muted-foreground capitalize">
              {p.name ?? p.dataKey}
            </span>
            <span className="tabular ml-auto font-mono font-medium">
              {currency
                ? formatCurrency(p.value ?? 0)
                : (p.value ?? 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
