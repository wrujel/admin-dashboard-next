import { requireUser } from "@/app/lib/auth/dal";
import { getActivityFeed, getDashboardData } from "@/app/lib/data";
import { DashboardShell } from "@/app/ui/shell/dashboard-shell";
import { SimulatorProvider } from "@/app/providers/simulator-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  // Seed the live simulator from the data loaded on this request (DB when
  // configured, otherwise mock). The simulator then runs client-side only.
  const [data, activity] = await Promise.all([
    getDashboardData(),
    getActivityFeed(24),
  ]);

  return (
    <SimulatorProvider
      seed={{
        kpis: data.kpis,
        revenue: data.revenue,
        categories: data.categories,
        traffic: data.traffic,
        topProducts: data.topProducts,
        transactions: data.transactions,
        activity,
        counts: data.counts,
      }}
    >
      <DashboardShell user={user}>{children}</DashboardShell>
    </SimulatorProvider>
  );
}
