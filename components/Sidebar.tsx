"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, BarChart3, Settings, ShieldAlert, Activity } from "lucide-react";
import clsx from "clsx";
import { useSimulation } from "@/context/SimulationContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { threatLevel, statusBar } = useSimulation();

  const navItems = [
    { name: "หน้าหลัก", href: "/", icon: Map },
    { name: "จุดวิเคราะห์ และ กล้องวงจรปิด", href: "/analytics", icon: BarChart3 },
    { name: "แผงควบคุมระบบ", href: "/system", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-white text-slate-800 border-r border-slate-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <img 
            src="https://upload.wikimedia.org/wikipedia/th/7/7d/%E0%B8%95%E0%B8%A3%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%A1%E0%B8%AD%E0%B8%B8%E0%B8%97%E0%B8%A2%E0%B8%B2%E0%B8%99%E0%B9%81%E0%B8%AB%E0%B9%88%E0%B8%87%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B8%B4_%E0%B8%AA%E0%B8%B1%E0%B8%95%E0%B8%A7%E0%B9%8C%E0%B8%9B%E0%B9%88%E0%B8%B2_%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%9E%E0%B8%B1%E0%B8%99%E0%B8%98%E0%B8%B8%E0%B9%8C%E0%B8%9E%E0%B8%B7%E0%B8%8A.png" 
            alt="DNP Logo" 
            className="w-10 h-10 object-contain"
          />
          <h1 className="text-xl font-bold text-slate-900 leading-tight">
            WCO Monitor
          </h1>
        </div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-3 border-t border-slate-100 pt-2">Elephant Early Warning</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-3">โดย กรมอุทยานแห่งชาติ สัตว์ป่า</p>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">และพันธุ์พืช</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} className={isActive ? "text-green-600" : "text-slate-400"} />
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className={clsx(
            "p-4 rounded-xl border",
            threatLevel === "LOW" ? "bg-green-50 border-green-100" :
            threatLevel === "MEDIUM" ? "bg-orange-50 border-orange-100" :
            "bg-red-50 border-red-100"
        )}>
            <div className="flex items-center gap-2 mb-2">
                <ShieldAlert size={18} className={clsx(
                    threatLevel === "LOW" ? "text-green-600" :
                    threatLevel === "MEDIUM" ? "text-orange-600" :
                    "text-red-600"
                )} />
                <span className={clsx(
                    "font-bold text-sm",
                    threatLevel === "LOW" ? "text-green-800" :
                    threatLevel === "MEDIUM" ? "text-orange-800" :
                    "text-red-800"
                )}>Threat: {threatLevel}</span>
            </div>
            <p className="text-xs text-slate-600 leading-tight">
                {statusBar}
            </p>
        </div>
      </div>
    </div>
  );
}
