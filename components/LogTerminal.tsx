"use client";

import { useSimulation } from "@/context/SimulationContext";
import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";
import clsx from "clsx";

export default function LogTerminal() {
  const { logs } = useSimulation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-slate-50 text-slate-700 font-mono text-xs rounded-xl overflow-hidden flex flex-col h-full shadow-sm border border-slate-200">
      <div className="bg-white px-4 py-2 border-b border-slate-200 flex items-center gap-2">
        <Terminal size={14} className="text-slate-400" />
        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">System Feed</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5">
        {logs.map((log, i) => (
            <div key={i} className="flex gap-2">
                <span className="text-indigo-400 font-bold shrink-0">{log.split("]")[0]}]</span>
                <span className={clsx(
                  log.includes("[WARN]") || log.includes("[ALERT]") ? "text-orange-600 font-semibold" : 
                  log.includes("[ALARM]") ? "text-red-600 font-bold" : "text-slate-600"
                )}>{log.split("]")[1]}</span>
            </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
