"use client";

import { DownloadIcon, FileTextIcon, PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/app/ui/primitives/button";
import { Badge } from "@/app/ui/primitives/badge";
import { Panel } from "@/app/ui/widgets/panel";
import { StatusBadge } from "@/app/ui/widgets/status-badge";

interface Report {
  id: string;
  name: string;
  type: string;
  period: string;
  created: string;
  status: "ready" | "generating" | "scheduled";
  size: string;
}

const REPORTS: Report[] = [
  {
    id: "r1",
    name: "Monthly revenue",
    type: "Revenue",
    period: "Jun 2026",
    created: "Jun 24, 2026",
    status: "ready",
    size: "248 KB",
  },
  {
    id: "r2",
    name: "Traffic & acquisition",
    type: "Traffic",
    period: "Q2 2026",
    created: "Jun 22, 2026",
    status: "ready",
    size: "512 KB",
  },
  {
    id: "r3",
    name: "Inventory snapshot",
    type: "Inventory",
    period: "Jun 2026",
    created: "Jun 20, 2026",
    status: "ready",
    size: "96 KB",
  },
  {
    id: "r4",
    name: "Customer cohorts",
    type: "Users",
    period: "H1 2026",
    created: "Jun 26, 2026",
    status: "generating",
    size: "—",
  },
  {
    id: "r5",
    name: "Tax summary",
    type: "Finance",
    period: "Q2 2026",
    created: "Jul 1, 2026",
    status: "scheduled",
    size: "—",
  },
];

export function ReportsPanel() {
  function generate() {
    toast.success("Report queued — you'll be notified when it's ready.");
  }
  function download(r: Report) {
    toast.success(`Downloading “${r.name}” (${r.size})`);
  }

  return (
    <Panel
      title="Saved reports"
      description={`${REPORTS.length} reports`}
      action={
        <Button size="sm" onClick={generate}>
          <PlusIcon />
          Generate report
        </Button>
      }
      noPadding
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-muted-foreground border-b text-xs">
              <th className="px-4 py-2.5 text-left font-medium">Report</th>
              <th className="px-3 py-2.5 text-left font-medium">Period</th>
              <th className="px-3 py-2.5 text-left font-medium">Created</th>
              <th className="px-3 py-2.5 text-left font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-muted/40 border-b transition-colors last:border-0"
              >
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
                      <FileTextIcon className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-muted-foreground text-xs">{r.type}</p>
                    </div>
                  </div>
                </td>
                <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                  {r.period}
                </td>
                <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                  {r.created}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => download(r)}
                    disabled={r.status !== "ready"}
                    aria-label={`Download ${r.name}`}
                  >
                    <DownloadIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
