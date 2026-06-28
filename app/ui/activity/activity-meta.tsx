import {
  LogInIcon,
  type LucideIcon,
  PackageIcon,
  ServerIcon,
  ShoppingCartIcon,
  UserPlusIcon,
} from "lucide-react";

import type { ActivityType } from "@/app/lib/types";

/** Shared icon + tone per activity type — keeps the feed and notifications in sync. */
export const ACTIVITY_META: Record<
  ActivityType,
  { icon: LucideIcon; className: string }
> = {
  order: { icon: ShoppingCartIcon, className: "text-chart-1 bg-chart-1/10" },
  user: { icon: UserPlusIcon, className: "text-info bg-info/10" },
  product: { icon: PackageIcon, className: "text-warning bg-warning/10" },
  auth: {
    icon: LogInIcon,
    className: "text-[var(--color-chart-4)] bg-[var(--color-chart-4)]/10",
  },
  system: { icon: ServerIcon, className: "text-muted-foreground bg-muted" },
};
