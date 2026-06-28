"use client";

import { motion } from "motion/react";
import { ShieldCheckIcon, TrendingUpIcon, ZapIcon } from "lucide-react";

import { Logo } from "@/app/ui/brand";
import { AnimatedNumber } from "@/app/ui/widgets/animated-number";
import { Sparkline } from "@/app/ui/widgets/sparkline";
import { formatCompact, formatCurrency } from "@/lib/utils";

const tiles = [
  {
    icon: TrendingUpIcon,
    label: "MRR",
    value: 284200,
    format: (n: number) => formatCurrency(n),
    spark: [22, 30, 26, 38, 35, 48, 52, 49, 61, 58, 70, 78],
  },
  {
    icon: ZapIcon,
    label: "Requests / min",
    value: 18420,
    format: (n: number) => formatCompact(n),
    spark: [40, 42, 38, 55, 60, 52, 68, 64, 72, 70, 83, 88],
  },
];

const ticker = [
  "AAPL +1.24%",
  "NVDA +3.41%",
  "ACME ▲ 982 orders",
  "SaaS MRR ▲ 6.2%",
  "Churn ▼ 0.4%",
  "TSLA +0.82%",
  "Uptime 99.99%",
];

export function LoginAside() {
  return (
    <aside className="bg-sidebar relative hidden flex-col justify-between overflow-hidden border-r p-10 lg:flex">
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="bg-primary/10 absolute -top-40 -left-40 size-[34rem] rounded-full blur-3xl" />
      <div className="bg-[var(--color-chart-4)]/10 absolute -right-40 -bottom-40 size-[30rem] rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex items-center gap-2.5"
      >
        <Logo size={32} />
        <span className="text-lg font-semibold tracking-tight">Nexus</span>
      </motion.div>

      <div className="relative space-y-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="max-w-md text-3xl leading-tight font-semibold tracking-tight text-balance"
        >
          The command center for your{" "}
          <span className="text-gradient">commerce</span>.
        </motion.h2>

        <div className="grid max-w-md grid-cols-2 gap-3">
          {tiles.map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
              className="border-border/60 bg-card/60 rounded-xl border p-4 backdrop-blur-sm panel-sheen"
            >
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <t.icon className="size-3.5" />
                {t.label}
              </div>
              <AnimatedNumber
                value={t.value}
                format={t.format}
                className="mt-1 block font-mono text-xl font-semibold tabular"
              />
              <Sparkline data={t.spark} className="mt-2 h-7" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-muted-foreground flex items-center gap-2 text-xs"
        >
          <ShieldCheckIcon className="text-positive size-4" />
          End-to-end encrypted · SOC 2 ready · role-based access
        </motion.div>
      </div>

      {/* Live ticker */}
      <div className="relative -mx-10 -mb-10 overflow-hidden border-t py-3">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap will-change-transform">
          {[...ticker, ...ticker].map((t, i) => (
            <span
              key={i}
              className="text-muted-foreground font-mono text-xs tabular"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
