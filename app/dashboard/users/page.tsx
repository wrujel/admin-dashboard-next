import type { Metadata } from "next";

import { getUsersData } from "@/app/lib/data";
import { UsersTable } from "@/app/ui/users/users-table";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  const users = await getUsersData();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users"
        description={`${users.length} members in your workspace`}
      />
      <UsersTable data={users} />
    </div>
  );
}
