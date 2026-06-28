"use client";

import * as React from "react";
import { motion } from "motion/react";

import { cn, formatDate, timeAgo } from "@/lib/utils";
import { Panel } from "@/app/ui/widgets/panel";
import { Button } from "@/app/ui/primitives/button";
import { ACTIVITY_META } from "@/app/ui/activity/activity-meta";
import type { ActivityItem, ActivityType } from "@/app/lib/types";

const FILTERS: { value: "all" | ActivityType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "order", label: "Orders" },
  { value: "user", label: "Users" },
  { value: "product", label: "Products" },
  { value: "auth", label: "Auth" },
  { value: "system", label: "System" },
];

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  const [filter, setFilter] = React.useState<"all" | ActivityType>("all");
  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <Panel
      title="Activity log"
      description={`${filtered.length} events`}
      noPadding
    >
      <div className="flex flex-wrap gap-1.5 border-b p-3">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <ul className="divide-y">
        {filtered.map((a, i) => {
          const m = ACTIVITY_META[a.type];
          const Icon = m.icon;
          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.3) }}
              className="flex items-center gap-3 px-4 py-3"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full",
                  m.className,
                )}
              >
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <span className="font-medium">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(a.date)}
                </p>
              </div>
              <span className="text-muted-foreground tabular shrink-0 text-xs">
                {timeAgo(a.date)} ago
              </span>
            </motion.li>
          );
        })}
        {filtered.length === 0 && (
          <li className="text-muted-foreground px-4 py-10 text-center text-sm">
            No events for this filter.
          </li>
        )}
      </ul>
    </Panel>
  );
}
