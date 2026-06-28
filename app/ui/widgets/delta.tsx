import { ArrowDownRightIcon, ArrowUpRightIcon } from "lucide-react";

import { cn, formatPercent } from "@/lib/utils";

export interface DeltaProps {
  /** Signed ratio, e.g. 0.124 for +12.4%. */
  value: number;
  className?: string;
  /** Inverts color semantics (e.g. when "down" is good). */
  invert?: boolean;
}

/** Compact trend indicator with directional arrow + colored percentage. */
export function Delta({ value, className, invert = false }: DeltaProps) {
  const up = value >= 0;
  const good = invert ? !up : up;

  return (
    <span
      className={cn(
        "tabular inline-flex items-center gap-0.5 text-xs font-medium",
        good ? "text-positive" : "text-negative",
        className,
      )}
    >
      {up ? (
        <ArrowUpRightIcon className="size-3.5" />
      ) : (
        <ArrowDownRightIcon className="size-3.5" />
      )}
      {formatPercent(value)}
    </span>
  );
}
