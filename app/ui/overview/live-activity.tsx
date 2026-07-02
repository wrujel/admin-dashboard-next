"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { ActivityFeed } from "./activity-feed";

export function LiveActivity({ className }: { className?: string }) {
  const { activity } = useSimulator();
  return <ActivityFeed data={activity.slice(0, 8)} className={className} />;
}
