import type { Metadata } from "next";

import { createUser } from "@/app/actions/user.actions";
import { UserForm } from "@/app/ui/users/user-form";
import { Panel } from "@/app/ui/widgets/panel";
import { PageHeader } from "@/app/ui/widgets/page-header";

export const metadata: Metadata = { title: "Add user" };

export default function AddUserPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Add user"
        description="Invite a new member to your workspace"
      />
      <div className="max-w-3xl">
        <Panel title="User details">
          <UserForm action={createUser} />
        </Panel>
      </div>
    </div>
  );
}
