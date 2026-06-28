import * as React from "react";

import { cn } from "@/lib/utils";
import { Card } from "@/app/ui/primitives/card";

/** Consistent titled panel chrome used across the dashboard. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  noPadding = false,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  noPadding?: boolean;
}) {
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground truncate text-xs">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className={cn(!noPadding && "p-4", contentClassName)}>
        {children}
      </div>
    </Card>
  );
}
