"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { ActivityTimeline } from "./activity-timeline";

export function LiveActivityTimeline() {
  const { activity } = useSimulator();
  return <ActivityTimeline items={activity} />;
}
