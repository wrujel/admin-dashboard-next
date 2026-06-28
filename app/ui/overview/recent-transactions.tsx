import { Avatar, AvatarFallback } from "@/app/ui/primitives/avatar";
import { Panel } from "@/app/ui/widgets/panel";
import { StatusBadge } from "@/app/ui/widgets/status-badge";
import type { TransactionRow } from "@/app/lib/types";
import { formatCurrency, timeAgo } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function RecentTransactions({
  data,
  className,
}: {
  data: TransactionRow[];
  className?: string;
}) {
  return (
    <Panel
      title="Recent transactions"
      description="Latest store orders"
      noPadding
      className={className}
    >
      <div className="divide-y">
        {data.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 px-4 py-2.5">
            <Avatar className="size-8">
              <AvatarFallback>{initials(tx.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{tx.name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {tx.method} · {timeAgo(tx.date)} ago
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <StatusBadge
                status={tx.status}
                className="hidden sm:inline-flex"
              />
              <span className="tabular w-20 text-right font-mono text-sm font-medium">
                {formatCurrency(tx.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
