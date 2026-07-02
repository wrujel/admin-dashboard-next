"use client";

import * as React from "react";

import {
  createSimulation,
  tickSimulation,
  type SimulationSeed,
  type SimulationSnapshot,
} from "@/app/lib/simulator";

const TICK_MS = 1000;
const SPEEDS: readonly number[] = [1, 2, 4];

interface SimulatorControls {
  running: boolean;
  speed: number;
  toggle: () => void;
  cycleSpeed: () => void;
}

const DataContext = React.createContext<SimulationSnapshot | null>(null);
const ControlsContext = React.createContext<SimulatorControls | null>(null);

/**
 * Holds the live, client-only store simulation. Seeded deterministically from
 * data loaded on the server (DB or mock), then advanced one tick per second in
 * the browser — it never writes to the database. Data and controls live in
 * separate contexts so control consumers (topbar chip) don't re-render on
 * every tick.
 */
export function SimulatorProvider({
  seed,
  children,
}: {
  seed: SimulationSeed;
  children: React.ReactNode;
}) {
  const [snapshot, setSnapshot] = React.useState(() => createSimulation(seed));
  const [running, setRunning] = React.useState(true);
  const [speed, setSpeed] = React.useState(1);

  React.useEffect(() => {
    if (!running) return;
    const interval = setInterval(
      () => setSnapshot((prev) => tickSimulation(prev, speed)),
      TICK_MS,
    );
    return () => clearInterval(interval);
  }, [running, speed]);

  const controls = React.useMemo<SimulatorControls>(
    () => ({
      running,
      speed,
      toggle: () => setRunning((r) => !r),
      cycleSpeed: () =>
        setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]),
    }),
    [running, speed],
  );

  return (
    <ControlsContext.Provider value={controls}>
      <DataContext.Provider value={snapshot}>{children}</DataContext.Provider>
    </ControlsContext.Provider>
  );
}

/** The live snapshot — re-renders consumers on every tick. */
export function useSimulator(): SimulationSnapshot {
  const ctx = React.useContext(DataContext);
  if (!ctx) {
    throw new Error("useSimulator must be used within a SimulatorProvider");
  }
  return ctx;
}

/** Pause/resume + speed — changes only when the user toggles them. */
export function useSimulatorControls(): SimulatorControls {
  const ctx = React.useContext(ControlsContext);
  if (!ctx) {
    throw new Error(
      "useSimulatorControls must be used within a SimulatorProvider",
    );
  }
  return ctx;
}
