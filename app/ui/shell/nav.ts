import {
  ActivityIcon,
  BarChart3Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  PackageIcon,
  SettingsIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

export interface NavLeaf {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  badge?: string;
  children?: NavLeaf[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const nav: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon },
      {
        title: "Analytics",
        icon: BarChart3Icon,
        children: [
          {
            title: "Revenue",
            href: "/dashboard/analytics/revenue",
            icon: TrendingUpIcon,
          },
          {
            title: "Reports",
            href: "/dashboard/analytics/reports",
            icon: FileTextIcon,
          },
        ],
      },
    ],
  },
  {
    label: "Manage",
    items: [
      { title: "Users", href: "/dashboard/users", icon: UsersIcon },
      { title: "Products", href: "/dashboard/products", icon: PackageIcon },
      { title: "Activity", href: "/dashboard/activity", icon: ActivityIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
    ],
  },
];

/** Flat list of all navigable leaves (used by the command palette). */
export const navItems: NavLeaf[] = nav.flatMap((g) =>
  g.items.flatMap((i) =>
    i.children
      ? i.children
      : i.href
        ? [{ title: i.title, href: i.href, icon: i.icon }]
        : [],
  ),
);
