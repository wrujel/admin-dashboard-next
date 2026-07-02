"use client";

import { PauseIcon, PlayIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSimulatorControls } from "@/app/providers/simulator-provider";

/** Start/pause + speed control for the live data simulation (topbar chip). */
export function SimulationToggle() {
  const { running, speed, toggle, cycleSpeed } = useSimulatorControls();

  return (
    <div className="ml-1.5 hidden items-center sm:flex">
      <button
        onClick={toggle}
        aria-pressed={running}
        aria-label={running ? "Pause live simulation" : "Start live simulation"}
        title={running ? "Pause simulation" : "Start simulation"}
        className="text-muted-foreground hover:text-foreground hover:bg-accent flex items-center gap-1.5 rounded-full py-1 pr-2 pl-1.5 text-xs transition-colors"
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            running ? "bg-positive pulse-dot" : "bg-muted-foreground",
          )}
        />
        <span className="tabular">{running ? "Live" : "Paused"}</span>
        {running ? (
          <PauseIcon className="size-3" />
        ) : (
          <PlayIcon className="size-3" />
        )}
      </button>
      <button
        onClick={cycleSpeed}
        disabled={!running}
        aria-label={`Simulation speed ${speed}x — click to change`}
        title="Simulation speed"
        className="text-muted-foreground hover:text-foreground hover:bg-accent tabular rounded-full px-1.5 py-1 font-mono text-[10px] transition-colors disabled:opacity-40"
      >
        {speed}×
      </button>
    </div>
  );
}
