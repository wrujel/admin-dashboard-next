import { requireUser } from "@/app/lib/auth/dal";
import { getActivityFeed } from "@/app/lib/data";
import { DashboardShell } from "@/app/ui/shell/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const activity = await getActivityFeed(8);

  return (
    <DashboardShell user={user} activity={activity}>
      {children}
    </DashboardShell>
  );
}
