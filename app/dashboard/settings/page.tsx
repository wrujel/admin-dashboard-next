import type { Metadata } from "next";

import { getCurrentUser } from "@/app/lib/auth/dal";
import { SettingsView } from "@/app/ui/settings/settings-view";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = (await getCurrentUser())!;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Settings"
        description="Manage your account, appearance and notifications."
      />
      <SettingsView user={user} />
    </div>
  );
}
