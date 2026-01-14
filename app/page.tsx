"use client";

import dynamic from "next/dynamic";
import LogTerminal from "@/components/LogTerminal";
import { useSimulation, SimulationMode } from "@/context/SimulationContext";
import { Play, AlertTriangle, Smartphone } from "lucide-react";
import clsx from "clsx";

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function Dashboard() {
  const { simMode, setSimMode, triggerScenario, threatLevel } = useSimulation();

  const scenarios: SimulationMode[] = [
    "Normal Operations",
    "Scenario A: Buffer Breach",
    "Scenario B: Critical Threat",
    "Scenario C: System Health Check"
  ];

  return (
    <div className="flex flex-col gap-6 pb-8">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Dashboard</h1>
          <p className="text-slate-500">Real-Time Monitoring & Early Warning System</p>
        </div>

        <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
            <select 
                value={simMode}
                onChange={(e) => setSimMode(e.target.value as SimulationMode)}
                className="bg-slate-50 border border-slate-200 text-sm rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
            >
                {scenarios.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button 
                onClick={() => triggerScenario(simMode)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
            >
                <Play size={16} /> Run Simulation
            </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* Map Section (3 cols) */}
        <div className={clsx(
            "lg:col-span-3 flex flex-col gap-4 transition-all duration-500",
            threatLevel === "LOW" ? "min-h-[70vh]" : "min-h-[400px]"
        )}>
            <div className="flex-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 h-full relative">
                <MapComponent />
                
                {/* Threat Overlay */}
                {threatLevel === "HIGH" && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-lg z-[1000] animate-pulse flex items-center gap-2 font-bold">
                        <AlertTriangle size={20} /> CRITICAL THREAT DETECTED
                    </div>
                )}
            </div>
        </div>

        {/* Logs Section (1 col) */}
        <div className="lg:col-span-1 h-full min-h-[400px]">
            <LogTerminal />
        </div>
      </div>

      {/* Villager View Mockup (Conditional) */}
      {threatLevel !== "LOW" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone size={20} /> Villager Notification Preview
            </h3>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-64 border-8 border-slate-800 rounded-[2rem] h-96 bg-white overflow-hidden relative shadow-xl shrink-0">
                    <div className="absolute top-0 w-full h-6 bg-slate-800 flex justify-center"><div className="w-16 h-3 bg-black rounded-b-lg"></div></div>
                    <div className="p-4 mt-8 space-y-3">
                         <div className="bg-green-500 text-white p-3 rounded-xl shadow-sm text-xs">
                            <div className="font-bold mb-1 flex justify-between">LINE Notify <span>Now</span></div>
                            ⚠️ Warning: Elephant activity detected near your location. Please stay indoors.
                         </div>
                         <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-500">
                            Map location shared...
                         </div>
                    </div>
                </div>
                <div className="flex-1 text-slate-600">
                    <p>This preview demonstrates the <strong>LINE Notify</strong> alert received by villagers in the affected zone.</p>
                    <div className={clsx(
                        "mt-4 inline-block px-4 py-2 rounded-lg font-medium text-sm",
                        threatLevel === "HIGH" ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    )}>
                        Status: {threatLevel === "HIGH" ? "EVACUATION ALERT SENT" : "CAUTION ADVISED"}
                    </div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}