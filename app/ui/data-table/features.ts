import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * The single feature set every table in the dashboard is built from.
 *
 * TanStack Table v9 no longer bundles every feature automatically — each one
 * is registered explicitly so unused code is tree-shaken away. Registering it
 * once here keeps `DataTable` and its sub-components typed against one shared
 * `TFeatures`, and each prerequisite feature is declared before the row model
 * that depends on it.
 */
export const dataTableFeatures = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnVisibilityFeature,

  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),

  // Registered individually rather than via the full registry objects so only
  // the comparators the dashboard actually uses end up in the bundle.
  filterFns: { includesString: filterFn_includesString },
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
});

/** Feature set of every dashboard table — the `TFeatures` generic argument. */
export type DataTableFeatures = typeof dataTableFeatures;
