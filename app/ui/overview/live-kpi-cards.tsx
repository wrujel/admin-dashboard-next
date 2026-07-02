"use client";

import { useSimulator } from "@/app/providers/simulator-provider";
import { KpiCards } from "./kpi-cards";

export function LiveKpiCards() {
  const { kpis } = useSimulator();
  return <KpiCards kpis={kpis} />;
}
