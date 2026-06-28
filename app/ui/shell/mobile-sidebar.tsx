"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { nav } from "./nav";
import { BrandMark } from "@/app/ui/brand";

export function MobileSidebar({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);
  const close = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" />
        <DialogPrimitive.Content className="bg-sidebar data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r shadow-xl duration-300 lg:hidden">
          <DialogPrimitive.Title className="sr-only">
            Navigation
          </DialogPrimitive.Title>
          <div className="flex h-14 items-center border-b px-4">
            <BrandMark />
          </div>
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {nav.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-muted-foreground/70 px-3 pb-1 text-[10px] font-semibold tracking-widest uppercase">
                  {group.label}
                </p>
                {group.items.map((item) =>
                  item.children ? (
                    <div key={item.title} className="space-y-0.5">
                      <div className="text-muted-foreground flex items-center gap-3 px-3 py-2 text-sm font-medium">
                        <item.icon className="size-4.5 shrink-0" />
                        {item.title}
                      </div>
                      <div className="ml-[1.4rem] space-y-0.5 border-l pl-3">
                        {item.children.map((child) => {
                          const active = isActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={close}
                              className={cn(
                                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                                active
                                  ? "bg-accent text-foreground font-medium"
                                  : "text-muted-foreground hover:text-foreground",
                              )}
                            >
                              <span
                                className={cn(
                                  "size-1.5 rounded-full",
                                  active
                                    ? "bg-primary"
                                    : "bg-muted-foreground/40",
                                )}
                              />
                              {child.title}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href!}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href!)
                          ? "bg-accent text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      )}
                    >
                      <item.icon className="size-4.5 shrink-0" />
                      {item.title}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
