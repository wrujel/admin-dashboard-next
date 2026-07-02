"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { TopProducts } from "./top-products";

export function LiveTopProducts() {
  const { topProducts } = useSimulator();
  return <TopProducts data={topProducts} />;
}
