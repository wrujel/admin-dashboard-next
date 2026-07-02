"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { CategoryBars } from "./category-bars";

export function LiveCategoryBars({ className }: { className?: string }) {
  const { categories } = useSimulator();
  return <CategoryBars data={categories} className={className} />;
}
