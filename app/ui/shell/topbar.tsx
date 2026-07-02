"use client";

import { usePathname } from "next/navigation";
import { MenuIcon, SearchIcon } from "lucide-react";

import { navItems } from "./nav";
import { ThemeToggle } from "./theme-toggle";
import { Notifications } from "./notifications";
import { SimulationToggle } from "./simulation-toggle";
import { UserMenu } from "./user-menu";
import { Button } from "@/app/ui/primitives/button";
import { Separator } from "@/app/ui/primitives/separator";
import type { SessionUser } from "@/app/lib/auth/dal";

function titleFor(pathname: string) {
  const exact = navItems.find((i) => i.href === pathname);
  if (exact) return exact.title;
  const prefix = navItems
    .filter((i) => i.href !== "/dashboard" && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0];
  if (pathname.endsWith("/add"))
    return `New ${(prefix?.title ?? "item").replace(/s$/, "")}`;
  return prefix?.title ?? "Dashboard";
}

export function Topbar({
  user,
  onOpenCommand,
  onOpenMobile,
}: {
  user: SessionUser;
  onOpenCommand: () => void;
  onOpenMobile: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-2 border-b px-3 backdrop-blur-md lg:px-5">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenMobile}
        aria-label="Open menu"
      >
        <MenuIcon />
      </Button>

      <h1 className="truncate text-sm font-semibold tracking-tight">
        {titleFor(pathname)}
      </h1>
      <SimulationToggle />

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={onOpenCommand}
          className="text-muted-foreground hover:bg-accent hover:text-foreground border-border/70 hidden h-8 w-56 items-center gap-2 rounded-lg border px-2.5 text-sm transition-colors md:flex"
        >
          <SearchIcon className="size-4" />
          <span>Search…</span>
          <kbd className="bg-muted text-muted-foreground ml-auto inline-flex h-5 items-center rounded border px-1.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={onOpenCommand}
          aria-label="Search"
        >
          <SearchIcon />
        </Button>

        <Notifications />

        <ThemeToggle />
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserMenu user={user} />
      </div>
    </header>
  );
}
