import type { Metadata } from "next";

import { LiveActivityTimeline } from "@/app/ui/activity/live-activity-timeline";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity"
        description="A live log of everything happening in your workspace."
      />
      <LiveActivityTimeline />
    </div>
  );
}
