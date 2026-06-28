"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "motion/react";
import { SearchIcon, InboxIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/app/ui/primitives/input";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Enables the global search box and sets its placeholder. */
  searchPlaceholder?: string;
  /** Extra controls rendered in the toolbar (filters, actions). */
  toolbar?: React.ReactNode;
  /** Initial page size. */
  pageSize?: number;
  /** Message shown when there are no rows. */
  emptyState?: React.ReactNode;
  className?: string;
}

/**
 * A fully generic, reusable data table built on TanStack Table.
 * Handles sorting, global filtering, column visibility and pagination
 * for any row shape `TData`.
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  toolbar,
  pageSize = 10,
  emptyState,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: { pagination: { pageSize } },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {searchPlaceholder !== undefined && (
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9"
            />
          </div>
        )}
        <div className="flex items-center gap-2 sm:ml-auto">
          {toolbar}
          <DataTableViewOptions table={table} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card overflow-hidden rounded-xl border panel-sheen">
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-muted/40 hover:bg-muted/40 border-b"
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-muted-foreground h-10 px-3 text-left align-middle text-xs font-medium first:pl-4 last:pr-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.18,
                      delay: Math.min(i * 0.015, 0.2),
                    }}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/40 data-[state=selected]:bg-primary/5 border-b transition-colors last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2.5 align-middle first:pl-4 last:pr-4"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-48 p-0">
                    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-10">
                      {emptyState ?? (
                        <>
                          <InboxIcon className="size-8 opacity-40" />
                          <p className="text-sm">No results found.</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
