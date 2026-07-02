"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { RecentTransactions } from "./recent-transactions";

export function LiveTransactions({ className }: { className?: string }) {
  const { transactions } = useSimulator();
  return (
    <RecentTransactions data={transactions.slice(0, 8)} className={className} />
  );
}
