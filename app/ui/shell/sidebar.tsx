"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDownIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { nav, type NavItem } from "./nav";
import { BrandMark } from "@/app/ui/brand";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/ui/primitives/tooltip";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/app/ui/primitives/popover";

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem & { href: string };
  active: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active"
          className="bg-accent absolute inset-0 rounded-lg"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <item.icon className="relative z-10 size-4.5 shrink-0" />
      {!collapsed && (
        <span className="relative z-10 truncate">{item.title}</span>
      )}
      {active && !collapsed && (
        <span className="bg-primary relative z-10 ml-auto size-1.5 rounded-full" />
      )}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.title}</TooltipContent>
    </Tooltip>
  );
}

function NavBranch({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const isActive = useIsActive();
  const children = item.children ?? [];
  const childActive = children.some((c) => isActive(c.href));

  const [open, setOpen] = React.useState(childActive);
  // Auto-open when navigating into a child, without an effect.
  const [prev, setPrev] = React.useState(childActive);
  if (childActive !== prev) {
    setPrev(childActive);
    if (childActive) setOpen(true);
  }

  if (collapsed) {
    // Flyout so the subsections stay reachable when the rail is collapsed.
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            aria-label={item.title}
            className={cn(
              "flex w-full items-center justify-center rounded-lg py-2 transition-colors",
              childActive
                ? "text-foreground bg-accent"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <item.icon className="size-4.5 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-44 p-1"
        >
          <p className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
            {item.title}
          </p>
          {children.map((child) => {
            const active = isActive(child.href);
            return (
              <PopoverClose asChild key={child.href}>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-accent text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      active ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                  />
                  {child.title}
                </Link>
              </PopoverClose>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          childActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <item.icon className="size-4.5 shrink-0" />
        <span className="truncate">{item.title}</span>
        <ChevronDownIcon
          className={cn(
            "ml-auto size-4 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-0.5 ml-[1.4rem] space-y-0.5 border-l pl-3">
              {children.map((child) => {
                const active = isActive(child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                      active
                        ? "text-foreground bg-accent font-medium"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        active ? "bg-primary" : "bg-muted-foreground/40",
                      )}
                    />
                    {child.title}
                  </Link>
                );
              })}
            </div>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const isActive = useIsActive();

  return (
    <aside
      className={cn(
        "bg-sidebar hidden h-full shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[4.5rem]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center border-b px-3",
          collapsed ? "justify-center" : "gap-2",
        )}
      >
        {!collapsed && (
          <div className="flex-1 pl-1">
            <BrandMark />
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground hover:bg-accent flex size-8 items-center justify-center rounded-lg transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpenIcon className="size-4.5" />
          ) : (
            <PanelLeftCloseIcon className="size-4.5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {nav.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="text-muted-foreground/70 px-3 pb-1 text-[10px] font-semibold tracking-widest uppercase">
                {group.label}
              </p>
            )}
            {group.items.map((item) =>
              item.children ? (
                <NavBranch key={item.title} item={item} collapsed={collapsed} />
              ) : (
                <NavLink
                  key={item.href}
                  item={item as NavItem & { href: string }}
                  active={isActive(item.href!)}
                  collapsed={collapsed}
                />
              ),
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
