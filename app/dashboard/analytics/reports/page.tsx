import type { Metadata } from "next";

import { ReportsPanel } from "@/app/ui/reports/reports-panel";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Generate, schedule and download store reports."
      />
      <ReportsPanel />
    </div>
  );
}
