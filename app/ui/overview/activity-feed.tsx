import { cn, timeAgo } from "@/lib/utils";
import { Panel } from "@/app/ui/widgets/panel";
import { ACTIVITY_META } from "@/app/ui/activity/activity-meta";
import type { ActivityItem } from "@/app/lib/types";

export function ActivityFeed({
  data,
  className,
}: {
  data: ActivityItem[];
  className?: string;
}) {
  return (
    <Panel
      title="Activity"
      description="Realtime events"
      noPadding
      className={className}
    >
      <ul className="divide-y">
        {data.map((a) => {
          const m = ACTIVITY_META[a.type];
          const Icon = m.icon;
          return (
            <li key={a.id} className="flex gap-3 px-4 py-2.5">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  m.className,
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">
                  <span className="font-medium">{a.actor}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>{" "}
                  <span className="font-medium">{a.target}</span>
                </p>
                <p className="text-muted-foreground text-xs">
                  {timeAgo(a.date)} ago
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
