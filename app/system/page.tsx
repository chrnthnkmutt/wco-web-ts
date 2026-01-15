"use client";

import { useSimulation, Device } from "@/context/SimulationContext";
import { Battery, Signal, Activity, RefreshCw, Power, FileText, Wifi } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function SystemPage() {
    const { devices } = useSimulation();
    const [selectedDeviceCoords, setSelectedDeviceCoords] = useState<[number, number] | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

    const handleRowClick = (device: Device) => {
        setSelectedDeviceCoords(device.coordinates);
        setSelectedDeviceId(device.id);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <h1 className="text-2xl font-bold text-slate-800">System Control Center</h1>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <Wifi size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Network Uptime (24h)</p>
                        <p className="text-2xl font-bold text-slate-800">99.8%</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Signal size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Avg. Signal Strength</p>
                        <p className="text-2xl font-bold text-slate-800">-65 dBm</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Active Nodes</p>
                        <p className="text-2xl font-bold text-slate-800">{devices.filter(d => d.status === "Online").length} / {devices.length}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Device Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">Device Status Overview</h3>
                        <span className="text-xs text-slate-500">Auto-refresh: 30s</span>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm min-w-[600px]">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4">Device ID</th>
                                    <th className="px-6 py-4">Type</th>
                                    <th className="px-6 py-4">Location</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Battery</th>
                                    <th className="px-6 py-4">Coordinates</th>
                                    <th className="px-6 py-4">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {devices.map((device) => (
                                    <tr 
                                        key={device.id} 
                                        onClick={() => handleRowClick(device)}
                                        className={clsx(
                                            "cursor-pointer transition-colors text-xs md:text-sm",
                                            selectedDeviceId === device.id ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-50"
                                        )}
                                    >
                                        <td className="px-6 py-4 font-bold text-slate-800">{device.id}</td>
                                        <td className="px-6 py-4 text-slate-500">{device.type}</td>
                                        <td className="px-6 py-4 text-slate-500">{device.location_name}</td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2 py-1 rounded-full text-xs font-semibold",
                                                device.status === "Online" ? "bg-green-100 text-green-700" :
                                                device.status === "Warning" ? "bg-orange-100 text-orange-700" :
                                                "bg-red-100 text-red-700"
                                            )}>
                                                {device.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2 text-slate-600">
                                            <Battery size={16} className={clsx(
                                                device.battery < 20 ? "text-red-500" : "text-green-500"
                                            )} />
                                            {device.battery}%
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {device.coordinates[0].toFixed(4)}, {device.coordinates[1].toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{device.last_active}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Column: Map + Diagnostics */}
                <div className="flex flex-col gap-6 h-full">
                    {/* Map Widget */}
                    <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm h-[300px] relative">
                         <div className="absolute top-2 left-2 z-[400] bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-600 shadow-sm">
                            Locate Device
                         </div>
                         <MapComponent flyToTarget={selectedDeviceCoords} />
                    </div>

                    {/* Diagnostics Panel */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1">
                        <h3 className="text-lg font-semibold mb-6 text-slate-800">Diagnostics</h3>
                        
                        <div className="space-y-4">
                            <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-3 transition-colors text-slate-700 font-medium text-sm">
                                <RefreshCw size={18} className="text-blue-500" />
                                Run System Scan
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-3 transition-colors text-slate-700 font-medium text-sm">
                                <Power size={18} className="text-orange-500" />
                                Reboot Offline Nodes
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-3 transition-colors text-slate-700 font-medium text-sm">
                                <FileText size={18} className="text-slate-500" />
                                Export Logs
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                                <p className="text-xs font-bold text-blue-900 uppercase">Next Maintenance</p>
                                <p className="text-sm text-blue-700 mt-1">Jan 15, 2026 (Sector B)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}