"use client";

import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import type { RevenueRange } from "@/app/lib/types";

const OPTIONS: { value: RevenueRange; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "q", label: "Quarter" },
  { value: "s", label: "Semester" },
  { value: "y", label: "Year" },
];

export function RangeToggle({ value }: { value: RevenueRange }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="bg-muted inline-flex items-center gap-0.5 rounded-lg p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() =>
            router.push(`${pathname}?range=${o.value}`, { scroll: false })
          }
          aria-pressed={value === o.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
