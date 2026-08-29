import { describe, expect, it } from "vitest";
import { LayoutDashboardIcon } from "lucide-react";

import {
  type NavGroup,
  flattenNav,
  nav,
  navItems,
} from "@/app/ui/shell/nav";

describe("nav", () => {
  it("exposes the three sidebar sections in order", () => {
    expect(nav.map((g) => g.label)).toEqual(["Overview", "Manage", "Account"]);
  });

  it("gives every group at least one item", () => {
    for (const group of nav) {
      expect(group.items.length).toBeGreaterThan(0);
    }
  });

  it("gives every item an icon and either an href or children", () => {
    for (const group of nav) {
      for (const item of group.items) {
        expect(item.icon).toBeDefined();
        expect(Boolean(item.href) || Boolean(item.children)).toBe(true);
      }
    }
  });

  it("points every href at a dashboard route", () => {
    for (const leaf of navItems) {
      expect(leaf.href.startsWith("/dashboard")).toBe(true);
    }
  });

  it("has no duplicate hrefs", () => {
    const hrefs = navItems.map((i) => i.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe("flattenNav", () => {
  it("flattens the real nav to its leaves", () => {
    expect(navItems.map((i) => i.href)).toEqual([
      "/dashboard",
      "/dashboard/analytics/revenue",
      "/dashboard/analytics/reports",
      "/dashboard/users",
      "/dashboard/products",
      "/dashboard/activity",
      "/dashboard/settings",
    ]);
  });

  it("replaces a parent with its children", () => {
    const groups: NavGroup[] = [
      {
        label: "Group",
        items: [
          {
            title: "Parent",
            icon: LayoutDashboardIcon,
            children: [
              { title: "Child", href: "/child", icon: LayoutDashboardIcon },
            ],
          },
        ],
      },
    ];
    expect(flattenNav(groups)).toEqual([
      { title: "Child", href: "/child", icon: LayoutDashboardIcon },
    ]);
  });

  it("keeps a leaf that only has an href", () => {
    const groups: NavGroup[] = [
      {
        label: "Group",
        items: [{ title: "Leaf", href: "/leaf", icon: LayoutDashboardIcon }],
      },
    ];
    expect(flattenNav(groups)).toEqual([
      { title: "Leaf", href: "/leaf", icon: LayoutDashboardIcon },
    ]);
  });

  it("drops an item with neither children nor an href", () => {
    const groups: NavGroup[] = [
      {
        label: "Group",
        items: [{ title: "Section header", icon: LayoutDashboardIcon }],
      },
    ];
    expect(flattenNav(groups)).toEqual([]);
  });

  it("returns an empty list for no groups", () => {
    expect(flattenNav([])).toEqual([]);
  });
});
