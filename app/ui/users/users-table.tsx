"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ColumnDef } from "@tanstack/react-table";
import {
  EyeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { DataTable } from "@/app/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/app/ui/data-table/data-table-column-header";
import { Avatar, AvatarFallback } from "@/app/ui/primitives/avatar";
import { Badge } from "@/app/ui/primitives/badge";
import { Button } from "@/app/ui/primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/ui/primitives/dropdown-menu";
import { StatusBadge } from "@/app/ui/widgets/status-badge";
import { deleteUser } from "@/app/actions/user.actions";
import type { UserRow } from "@/app/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function roleBadge(role: UserRow["role"]) {
  if (role === "admin") return <Badge variant="info">Admin</Badge>;
  if (role === "editor") return <Badge variant="secondary">Editor</Badge>;
  return <Badge variant="outline">Viewer</Badge>;
}

function RowActions({
  user,
  onDelete,
}: {
  user: UserRow;
  onDelete: (u: UserRow) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="ml-auto">
          <MoreHorizontalIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/users/${user.id}`}>
            <EyeIcon />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/users/${user.id}`}>
            <PencilIcon />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UsersTable({ data }: { data: UserRow[] }) {
  const router = useRouter();
  const [rows, setRows] = React.useState(data);
  // Resync when fresh server data arrives (after router.refresh), without an effect.
  const [dataSnapshot, setDataSnapshot] = React.useState(data);
  if (dataSnapshot !== data) {
    setDataSnapshot(data);
    setRows(data);
  }

  const onDelete = React.useCallback(
    async (u: UserRow) => {
      setRows((prev) => prev.filter((r) => r.id !== u.id));
      const res = await deleteUser(u.id);
      if (res.status === "error") {
        toast.error(res.message ?? "Could not delete");
        setRows(data);
      } else {
        toast.success(res.message ?? "User deleted");
        router.refresh();
      }
    },
    [data, router],
  );

  const columns = React.useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-7">
              <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => roleBadge(row.original.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "orders",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Orders" />
        ),
        cell: ({ row }) => (
          <span className="tabular font-mono">{row.original.orders}</span>
        ),
      },
      {
        accessorKey: "spend",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Spend" />
        ),
        cell: ({ row }) => (
          <span className="tabular font-mono">
            {formatCurrency(row.original.spend)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined" />
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground whitespace-nowrap">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <RowActions user={row.original} onDelete={onDelete} />
        ),
      },
    ],
    [onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search users…"
      toolbar={
        <Button asChild size="sm">
          <Link href="/dashboard/users/add">
            <PlusIcon />
            Add user
          </Link>
        </Button>
      }
    />
  );
}
