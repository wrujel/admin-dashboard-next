"use client";

import * as React from "react";

import type { ActivityItem, TransactionRow } from "@/app/lib/types";
import { nextActivity, nextTransaction } from "@/app/lib/simulator";

const TX_CAP = 20;
const ACTIVITY_CAP = 60;
const TICK_MS = 1000;

interface SimulatorContextValue {
  transactions: TransactionRow[];
  activity: ActivityItem[];
  running: boolean;
  toggle: () => void;
}

const SimulatorContext = React.createContext<SimulatorContextValue | null>(
  null,
);

/**
 * Holds the live, client-only ecommerce stream. Seeded from data loaded on the
 * server (DB or mock); from then on it generates one transaction + one activity
 * per second entirely in the browser — it never writes to the database.
 */
export function SimulatorProvider({
  initialTransactions,
  initialActivity,
  children,
}: {
  initialTransactions: TransactionRow[];
  initialActivity: ActivityItem[];
  children: React.ReactNode;
}) {
  const [transactions, setTransactions] =
    React.useState<TransactionRow[]>(initialTransactions);
  const [activity, setActivity] =
    React.useState<ActivityItem[]>(initialActivity);
  const [running, setRunning] = React.useState(true);

  React.useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTransactions((prev) => [nextTransaction(), ...prev].slice(0, TX_CAP));
      setActivity((prev) => [nextActivity(), ...prev].slice(0, ACTIVITY_CAP));
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [running]);

  const toggle = React.useCallback(() => setRunning((r) => !r), []);

  const value = React.useMemo<SimulatorContextValue>(
    () => ({ transactions, activity, running, toggle }),
    [transactions, activity, running, toggle],
  );

  return (
    <SimulatorContext.Provider value={value}>
      {children}
    </SimulatorContext.Provider>
  );
}

export function useSimulator() {
  const ctx = React.useContext(SimulatorContext);
  if (!ctx) {
    throw new Error("useSimulator must be used within a SimulatorProvider");
  }
  return ctx;
}
