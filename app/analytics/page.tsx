"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Camera, RefreshCw } from "lucide-react";

export default function AnalyticsPage() {
    
    // Data from Python version
    const sightingsData = [
        { name: "July", sightings: 12, incidents: 2 },
        { name: "Aug", sightings: 19, incidents: 4 },
        { name: "Sept", sightings: 15, incidents: 3 },
        { name: "Oct", sightings: 25, incidents: 8 },
        { name: "Nov", sightings: 32, incidents: 12 },
        { name: "Dec", sightings: 28, incidents: 10 },
    ];

    const threatData = [
        { name: 'Low', value: 70, color: '#22c55e' },
        { name: 'Medium', value: 20, color: '#f97316' },
        { name: 'High', value: 10, color: '#ef4444' },
    ];

    return (
        <div className="flex flex-col gap-6 h-full">
            <h1 className="text-2xl font-bold text-slate-800">Analytics & CCTV</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
                
                {/* Left Col: Charts */}
                <div className="flex flex-col gap-6">
                    {/* Historical Data */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex-1 min-h-[300px]">
                        <h3 className="text-lg font-semibold mb-4 text-slate-700">Historical Sightings & Incidents</h3>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={sightingsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="sightings" fill="#3b82f6" name="Sightings" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="incidents" fill="#ef4444" name="Incidents" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Threat Distribution */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[300px]">
                        <h3 className="text-lg font-semibold mb-4 text-slate-700">Threat Level Distribution (30 Days)</h3>
                        <div className="flex items-center justify-center h-full pb-8">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={threatData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {threatData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Col: CCTV */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                            <Camera size={20} /> Live CCTV Feed
                        </h3>
                        <span className="text-xs font-mono text-green-600 bg-green-100 px-2 py-1 rounded">CAM-04: LIVE</span>
                    </div>

                    <div className="flex-1 bg-black rounded-lg relative overflow-hidden group">
                        {/* Placeholder Image simulating Night Vision */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-black/80 z-10 pointer-events-none"></div>
                        
                        {/* Grid lines */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none z-10" style={{ backgroundImage: 'linear-gradient(#0f0 1px, transparent 1px), linear-gradient(90deg, #0f0 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>

                        {/* Content */}
                        <div className="h-full w-full flex items-center justify-center text-slate-500 bg-slate-900">
                             <p className="text-sm">Signal Strong. No Motion Detected.</p>
                        </div>

                        {/* UI Overlay */}
                        <div className="absolute top-4 left-4 z-20 text-green-500 font-mono text-xs">
                            REC ● [14-01-2026 23:45:12]
                        </div>
                        
                        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                             <button className="bg-slate-800/80 text-white p-2 rounded hover:bg-slate-700"><RefreshCw size={16} /></button>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <button className="py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium text-slate-600">Pan Left</button>
                        <button className="py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium text-slate-600">Zoom In</button>
                        <button className="py-2 px-4 bg-slate-100 hover:bg-slate-200 rounded text-sm font-medium text-slate-600">Pan Right</button>
                    </div>

                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-bold text-yellow-800 mb-1">AI Detection Log</h4>
                        <p className="text-xs text-yellow-700">No active threats detected in this sector.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
