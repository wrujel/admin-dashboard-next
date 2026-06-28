"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/app/ui/primitives/card";
import { AnimatedNumber } from "./animated-number";
import { Sparkline } from "./sparkline";
import { Delta } from "./delta";

type Accent = "primary" | "info" | "warning" | "negative" | "chart-4";

const ACCENT: Record<Accent, { text: string; bg: string; color: string }> = {
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    color: "var(--color-primary)",
  },
  info: { text: "text-info", bg: "bg-info/10", color: "var(--color-info)" },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    color: "var(--color-warning)",
  },
  negative: {
    text: "text-negative",
    bg: "bg-negative/10",
    color: "var(--color-negative)",
  },
  "chart-4": {
    text: "text-[var(--color-chart-4)]",
    bg: "bg-[var(--color-chart-4)]/10",
    color: "var(--color-chart-4)",
  },
};

export interface StatCardProps {
  label: string;
  value: number;
  format?: (n: number) => string;
  /** Signed ratio for the trend pill. */
  delta?: number;
  icon?: LucideIcon;
  spark?: number[];
  accent?: Accent;
  hint?: string;
  /** Stagger index for the entrance animation. */
  index?: number;
}

/** Animated KPI card: icon chip, count-up value, trend, sparkline. */
export function StatCard({
  label,
  value,
  format,
  delta,
  icon: Icon,
  spark,
  accent = "primary",
  hint,
  index = 0,
}: StatCardProps) {
  const a = ACCENT[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="h-full"
    >
      <Card className="group relative h-full gap-0 overflow-hidden py-0 transition-colors hover:border-foreground/15">
        <div className="flex items-start justify-between gap-3 p-4 pb-2">
          <div className="min-w-0">
            <p className="text-muted-foreground truncate text-xs font-medium tracking-wide uppercase">
              {label}
            </p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <AnimatedNumber
                value={value}
                format={format}
                className="font-mono text-2xl font-semibold tracking-tight tabular"
              />
              {typeof delta === "number" && <Delta value={delta} />}
            </div>
            {hint && (
              <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
            )}
          </div>
          {Icon && (
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                a.bg,
                a.text,
              )}
            >
              <Icon className="size-4.5" />
            </span>
          )}
        </div>
        {spark && spark.length > 1 && (
          <div className="mt-auto px-1 pt-1 pb-1">
            <Sparkline data={spark} color={a.color} />
          </div>
        )}
      </Card>
    </motion.div>
  );
}
