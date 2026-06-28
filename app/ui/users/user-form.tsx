"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/app/ui/primitives/button";
import { Input } from "@/app/ui/primitives/input";
import { Label } from "@/app/ui/primitives/label";
import { Textarea } from "@/app/ui/primitives/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/ui/primitives/select";
import {
  initialActionState,
  type ActionState,
} from "@/app/actions/action-state";
import type { UserRow } from "@/app/lib/types";

export function UserForm({
  action,
  user,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  user?: UserRow | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = React.useActionState(
    action,
    initialActionState,
  );
  const editing = Boolean(user);

  React.useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message ?? "Saved");
      router.push("/dashboard/users");
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message ?? "Something went wrong");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
      {user && <input type="hidden" name="id" value={user.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="ada.lovelace"
            defaultValue={user?.name}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            defaultValue={user?.email}
            required
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="password">
            Password{" "}
            {editing && (
              <span className="text-muted-foreground">(optional)</span>
            )}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={editing ? "Leave blank to keep" : "••••••••"}
            autoComplete="new-password"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="+1 555 0100" />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="isAdmin">Role</Label>
          <Select
            name="isAdmin"
            defaultValue={user?.role === "admin" ? "true" : "false"}
          >
            <SelectTrigger id="isAdmin" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Admin</SelectItem>
              <SelectItem value="false">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="isActive">Status</Label>
          <Select
            name="isActive"
            defaultValue={user?.status === "suspended" ? "false" : "true"}
          >
            <SelectTrigger id="isActive" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1.5 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            rows={2}
            placeholder="Street, city, country"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" asChild>
          <Link href="/dashboard/users">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2Icon className="animate-spin" />}
          {editing ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
