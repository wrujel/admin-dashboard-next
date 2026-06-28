"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileSidebar } from "./mobile-sidebar";
import { CommandMenu } from "./command-menu";
import type { SessionUser } from "@/app/lib/auth/dal";
import type { ActivityItem } from "@/app/lib/types";

export function DashboardShell({
  user,
  activity,
  children,
}: {
  user: SessionUser;
  activity: ActivityItem[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const mainRef = React.useRef<HTMLElement>(null);

  // The content area scrolls (not the document), so reset it on navigation.
  React.useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="bg-background flex h-svh overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          user={user}
          activity={activity}
          onOpenCommand={() => setCommandOpen(true)}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main ref={mainRef} className="flex-1 overflow-y-scroll">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mx-auto w-full max-w-[1600px] p-4 lg:p-6"
          >
            {children}
          </motion.div>
        </main>
      </div>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
