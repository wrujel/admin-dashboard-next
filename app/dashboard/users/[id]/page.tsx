import { notFound } from "next/navigation";

import { getUserById } from "@/app/lib/data";
import { updateUser } from "@/app/actions/user.actions";
import { UserForm } from "@/app/ui/users/user-form";
import { Panel } from "@/app/ui/widgets/panel";
import { PageHeader } from "@/app/ui/widgets/page-header";

export default async function EditUserPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <div className="space-y-5">
      <PageHeader title={user.name} description={user.email} />
      <div className="max-w-3xl">
        <Panel title="Edit user">
          <UserForm action={updateUser} user={user} />
        </Panel>
      </div>
    </div>
  );
}
