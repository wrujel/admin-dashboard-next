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
import { deleteProduct } from "@/app/actions/product.actions";
import type { ProductRow } from "@/app/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

function ProductThumb({ name }: { name: string }) {
  return (
    <span className="from-primary/25 to-[var(--color-chart-4)]/25 text-foreground/80 flex size-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-xs font-semibold">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function RowActions({
  product,
  onDelete,
}: {
  product: ProductRow;
  onDelete: (p: ProductRow) => void;
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
          <Link href={`/dashboard/products/${product.id}`}>
            <EyeIcon />
            View
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/products/${product.id}`}>
            <PencilIcon />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => onDelete(product)}
        >
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProductsTable({ data }: { data: ProductRow[] }) {
  const router = useRouter();
  const [rows, setRows] = React.useState(data);
  // Resync when fresh server data arrives (after router.refresh), without an effect.
  const [dataSnapshot, setDataSnapshot] = React.useState(data);
  if (dataSnapshot !== data) {
    setDataSnapshot(data);
    setRows(data);
  }

  const onDelete = React.useCallback(
    async (p: ProductRow) => {
      setRows((prev) => prev.filter((r) => r.id !== p.id));
      const res = await deleteProduct(p.id);
      if (res.status === "error") {
        toast.error(res.message ?? "Could not delete");
        setRows(data);
      } else {
        toast.success(res.message ?? "Product deleted");
        router.refresh();
      }
    },
    [data, router],
  );

  const columns = React.useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Product" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <ProductThumb name={row.original.name} />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.category}</Badge>
        ),
      },
      {
        accessorKey: "price",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Price" />
        ),
        cell: ({ row }) => (
          <span className="tabular font-mono">
            {formatCurrency(row.original.price, { maximumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Stock" />
        ),
        cell: ({ row }) => {
          const s = row.original.stock;
          return (
            <span
              className={cn(
                "tabular font-mono",
                s === 0 && "text-negative",
                s > 0 && s < 20 && "text-warning",
              )}
            >
              {s}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Added" />
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
          <RowActions product={row.original} onDelete={onDelete} />
        ),
      },
    ],
    [onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={rows}
      searchPlaceholder="Search products…"
      toolbar={
        <Button asChild size="sm">
          <Link href="/dashboard/products/add">
            <PlusIcon />
            Add product
          </Link>
        </Button>
      }
    />
  );
}
