"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type ThreatLevel = "LOW" | "MEDIUM" | "HIGH";
export type SimulationMode = "Normal Operations" | "Scenario A: Buffer Breach" | "Scenario B: Critical Threat" | "Scenario C: System Health Check";

export interface Device {
  id: string;
  type: "Vibration Sensor" | "Camera" | "Gateway";
  status: "Online" | "Offline" | "Warning";
  battery: number;
  coordinates: [number, number];
  last_active: string;
  location_name: string;
}

interface SimulationContextType {
  threatLevel: ThreatLevel;
  statusBar: string;
  elephantPos: [number, number];
  logs: string[];
  devices: Device[];
  simMode: SimulationMode;
  setSimMode: (mode: SimulationMode) => void;
  triggerScenario: (mode: SimulationMode) => Promise<void>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

const INITIAL_DEVICES: Device[] = [
  { id: "S-20", type: "Vibration Sensor", status: "Online", battery: 85, coordinates: [14.305, 101.380], last_active: "1 min ago", location_name: "Zone 2" },
  { id: "S-21", type: "Vibration Sensor", status: "Online", battery: 92, coordinates: [14.305, 101.420], last_active: "2 mins ago", location_name: "Zone 2" },
  { id: "CCTV-04", type: "Camera", status: "Online", battery: 100, coordinates: [14.275, 101.400], last_active: "Live", location_name: "Zone 3" },
  { id: "Node-4", type: "Gateway", status: "Online", battery: 15, coordinates: [14.330, 101.370], last_active: "5 mins ago", location_name: "Zone 1" },
  { id: "S-22", type: "Vibration Sensor", status: "Online", battery: 77, coordinates: [14.300, 101.440], last_active: "1 min ago", location_name: "Zone 2" },
  { id: "CCTV-05", type: "Camera", status: "Online", battery: 100, coordinates: [14.260, 101.410], last_active: "Live", location_name: "Zone 3" },
  { id: "GW-01", type: "Gateway", status: "Online", battery: 98, coordinates: [14.340, 101.430], last_active: "30 secs ago", location_name: "Zone 1" },
  { id: "GW-02", type: "Gateway", status: "Online", battery: 99, coordinates: [14.280, 101.360], last_active: "45 secs ago", location_name: "Zone 3" }
];

export const SimulationProvider = ({ children }: { children: ReactNode }) => {
  const [simMode, setSimMode] = useState<SimulationMode>("Normal Operations");
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>("LOW");
  const [statusBar, setStatusBar] = useState("Safe - Wildlife in Forest");
  const [elephantPos, setElephantPos] = useState<[number, number]>([14.32, 101.40]); 
  const [logs, setLogs] = useState<string[]>(["[09:00:00] System started."]);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
  };

  const triggerScenario = async (mode: SimulationMode) => {
    setSimMode(mode);

    let newPos: [number, number] = [14.32, 101.40];
    let newThreat: ThreatLevel = "LOW";
    let newStatus = "";

    if (mode === "Scenario A: Buffer Breach") {
      newPos = [14.30, 101.42]; newThreat = "MEDIUM"; newStatus = "WARNING - Buffer Zone Breach";
    } else if (mode === "Scenario B: Critical Threat") {
      newPos = [14.28, 101.44]; newThreat = "HIGH"; newStatus = "CRITICAL - Community Entry Imminent";
    }
    
    setThreatLevel(newThreat);
    setStatusBar(newStatus);
    setElephantPos(newPos);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        try {
          await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              lat: newPos[0], 
              lng: newPos[1], 
              status: newStatus, 
              threatLevel: newThreat,
              userLat,
              userLng
            })
          });
          console.log("🐘 Server Synced with Real Location");
        } catch (err) {
          console.error("Sync Failed", err);
        }
      });
    }
  };

  return (
    <SimulationContext.Provider value={{ threatLevel, statusBar, elephantPos, logs, devices, simMode, setSimMode, triggerScenario }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) throw new Error("useSimulation must be used within a SimulationProvider");
  return context;
};