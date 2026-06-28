import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/app/ui/primitives/badge";

type Variant = React.ComponentProps<typeof Badge>["variant"];

const MAP: Record<string, { variant: Variant; label: string }> = {
  completed: { variant: "positive", label: "Completed" },
  active: { variant: "positive", label: "Active" },
  pending: { variant: "warning", label: "Pending" },
  invited: { variant: "info", label: "Invited" },
  draft: { variant: "secondary", label: "Draft" },
  failed: { variant: "destructive", label: "Failed" },
  suspended: { variant: "destructive", label: "Suspended" },
  refunded: { variant: "secondary", label: "Refunded" },
  out_of_stock: { variant: "negative", label: "Out of stock" },
  ready: { variant: "positive", label: "Ready" },
  generating: { variant: "warning", label: "Generating" },
  scheduled: { variant: "info", label: "Scheduled" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const m = MAP[status] ?? { variant: "outline" as Variant, label: status };
  return (
    <Badge variant={m.variant} className={cn("gap-1.5", className)}>
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {m.label}
    </Badge>
  );
}
