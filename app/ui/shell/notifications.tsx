"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, CheckCheckIcon } from "lucide-react";

import { cn, timeAgo } from "@/lib/utils";
import { Button, buttonVariants } from "@/app/ui/primitives/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui/primitives/popover";
import { ACTIVITY_META } from "@/app/ui/activity/activity-meta";
import { useSimulator } from "@/app/providers/simulator-provider";

export function Notifications() {
  const { activity } = useSimulator();
  const items = activity.slice(0, 12);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());

  const unread = items.filter((i) => !readIds.has(i.id)).length;
  const markAll = () => setReadIds(new Set(items.map((i) => i.id)));
  const markOne = (id: string) => setReadIds((prev) => new Set(prev).add(id));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        >
          <BellIcon />
          {unread > 0 && (
            <span className="bg-negative absolute top-1.5 right-1.5 size-1.5 rounded-full" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <span className="bg-primary/15 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-medium">
                {unread} new
              </span>
            )}
          </div>
          <button
            onClick={markAll}
            disabled={unread === 0}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs disabled:opacity-40"
          >
            <CheckCheckIcon className="size-3.5" />
            Mark all read
          </button>
        </div>

        <ul className="max-h-80 divide-y overflow-y-auto">
          {items.length === 0 && (
            <li className="text-muted-foreground px-3 py-8 text-center text-sm">
              You&apos;re all caught up.
            </li>
          )}
          {items.map((a) => {
            const m = ACTIVITY_META[a.type];
            const Icon = m.icon;
            const isUnread = !readIds.has(a.id);
            return (
              <li key={a.id}>
                <button
                  onClick={() => markOne(a.id)}
                  className={cn(
                    "hover:bg-accent/50 flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                    isUnread && "bg-primary/5",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                      m.className,
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">
                      <span className="font-medium">{a.actor}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </span>
                    <span className="text-muted-foreground/70 mt-0.5 block text-[11px]">
                      {timeAgo(a.date)} ago
                    </span>
                  </span>
                  {isUnread && (
                    <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="border-t p-1.5">
          <PopoverClose asChild>
            <Link
              href="/dashboard/activity"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "w-full",
              )}
            >
              View all activity
            </Link>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
