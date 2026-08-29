import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/app/ui/data-table/data-table";
import { DataTableColumnHeader } from "@/app/ui/data-table/data-table-column-header";
import type { DataTableFeatures } from "@/app/ui/data-table/features";

/**
 * Behavioural cover for the shared table. It is the one place the TanStack
 * Table v9 feature registry is wired up, so sorting, filtering, pagination and
 * column visibility are all driven through the rendered UI here.
 */

interface Row extends Record<string, unknown> {
  id: string;
  name: string;
  units: number;
}

const columns: ColumnDef<DataTableFeatures, Row>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: "units",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Units" />
    ),
    cell: ({ row }) => <span>{row.original.units}</span>,
  },
];

const rows: Row[] = [
  { id: "1", name: "Aurora Phone X", units: 30 },
  { id: "2", name: "Nimbus Laptop 14", units: 10 },
  { id: "3", name: "Pulse Buds Pro", units: 20 },
];

const bodyRows = () =>
  screen
    .getAllByRole("row")
    .filter((r) => within(r).queryAllByRole("cell").length > 0);

describe("DataTable", () => {
  it("renders a row per record", () => {
    render(<DataTable columns={columns} data={rows} />);

    expect(screen.getByText("Aurora Phone X")).toBeInTheDocument();
    expect(screen.getByText("Nimbus Laptop 14")).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(3);
  });

  it("renders the column headers", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByRole("button", { name: /Name/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Units/ })).toBeInTheDocument();
  });

  it("shows the default empty state with no data", () => {
    render(<DataTable columns={columns} data={[]} />);
    expect(screen.getByText("No results found.")).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(1);
  });

  it("shows a custom empty state when given one", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyState={<p>Nothing to see.</p>}
      />,
    );
    expect(screen.getByText("Nothing to see.")).toBeInTheDocument();
  });

  it("hides the search box unless a placeholder is given", () => {
    const { rerender } = render(<DataTable columns={columns} data={rows} />);
    expect(screen.queryByPlaceholderText("Search…")).not.toBeInTheDocument();

    rerender(
      <DataTable columns={columns} data={rows} searchPlaceholder="Search…" />,
    );
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });

  it("filters rows through the global search box", async () => {
    const user = userEvent.setup();
    render(
      <DataTable columns={columns} data={rows} searchPlaceholder="Search…" />,
    );

    await user.type(screen.getByPlaceholderText("Search…"), "Nimbus");

    expect(screen.getByText("Nimbus Laptop 14")).toBeInTheDocument();
    expect(screen.queryByText("Aurora Phone X")).not.toBeInTheDocument();
    expect(bodyRows()).toHaveLength(1);
  });

  it("shows the empty state when the search matches nothing", async () => {
    const user = userEvent.setup();
    render(
      <DataTable columns={columns} data={rows} searchPlaceholder="Search…" />,
    );

    await user.type(screen.getByPlaceholderText("Search…"), "zzzz");
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("sorts ascending and descending from the column menu", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={rows} />);

    await user.click(screen.getByRole("button", { name: /Units/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Asc" }));

    let cells = bodyRows().map(
      (r) => within(r).getAllByRole("cell")[1].textContent,
    );
    expect(cells).toEqual(["10", "20", "30"]);

    await user.click(screen.getByRole("button", { name: /Units/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Desc" }));

    cells = bodyRows().map(
      (r) => within(r).getAllByRole("cell")[1].textContent,
    );
    expect(cells).toEqual(["30", "20", "10"]);
  });

  it("hides a column from the column menu", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={rows} />);

    await user.click(screen.getByRole("button", { name: /Units/ }));
    await user.click(await screen.findByRole("menuitem", { name: "Hide" }));

    expect(
      screen.queryByRole("button", { name: /Units/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Aurora Phone X")).toBeInTheDocument();
  });

  it("renders extra toolbar content", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        toolbar={<button>Add</button>}
      />,
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("reports the result count", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/results/)).toBeInTheDocument();
  });

  it("paginates and moves between pages", async () => {
    const user = userEvent.setup();
    const many: Row[] = Array.from({ length: 12 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      units: i,
    }));

    render(<DataTable columns={columns} data={many} pageSize={5} />);

    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText(/Page 2 of 3/)).toBeInTheDocument();
    expect(screen.getByText("Item 5")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Last page" }));
    expect(screen.getByText(/Page 3 of 3/)).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "First page" }));
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
  });

  it("disables the paging controls at each end", async () => {
    const user = userEvent.setup();
    const many: Row[] = Array.from({ length: 8 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
      units: i,
    }));

    render(<DataTable columns={columns} data={many} pageSize={5} />);

    expect(
      screen.getByRole("button", { name: "Previous page" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Next page" }));

    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("shows a single page for a short list", () => {
    render(<DataTable columns={columns} data={rows} pageSize={10} />);
    expect(screen.getByText(/Page 1 of 1/)).toBeInTheDocument();
  });
});
