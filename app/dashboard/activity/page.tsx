import type { Metadata } from "next";

import { getActivityFeed } from "@/app/lib/data";
import { ActivityTimeline } from "@/app/ui/activity/activity-timeline";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  const items = await getActivityFeed(30);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity"
        description="A live log of everything happening in your workspace."
      />
      <ActivityTimeline items={items} />
    </div>
  );
}
