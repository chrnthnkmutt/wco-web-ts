"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSimulation } from "@/context/SimulationContext";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default Leaflet icons in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

// Custom Icons
const elephantIcon = new L.Icon({
    iconUrl: "https://img.icons8.com/ios-filled/100/ffffff/elephant.png", 
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const sensorIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-md"></div>`
});

const cameraIcon = new L.DivIcon({
    className: "bg-transparent",
    html: `<div class="w-5 h-5 bg-blue-600 rounded-sm border-2 border-white shadow-md flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>`
});

// Inner component to handle programmatic map moves
function MapController({ target }: { target?: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 16, { animate: true, duration: 1.5 });
        }
    }, [target, map]);
    return null;
}

interface MapComponentProps {
    flyToTarget?: [number, number] | null;
}

export default function MapComponent({ flyToTarget }: MapComponentProps) {
    const { elephantPos, devices, simMode, threatLevel } = useSimulation();

    // Zone Coordinates
    const forestZone: [number, number][] = [[14.31, 101.35], [14.35, 101.35], [14.35, 101.45], [14.31, 101.45]];
    const bufferZone: [number, number][] = [[14.29, 101.35], [14.31, 101.35], [14.31, 101.45], [14.29, 101.45]];
    const communityZone: [number, number][] = [[14.25, 101.35], [14.29, 101.35], [14.29, 101.45], [14.25, 101.45]];

    return (
        <MapContainer 
            center={[14.30, 101.40]} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="h-full w-full rounded-xl z-0"
        >
            <MapController target={flyToTarget} />
            
            <TileLayer
                attribution='&copy; Google Maps'
                url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            />

            {/* Zones */}
            <Polygon positions={forestZone} pathOptions={{ color: 'green', fillOpacity: 0.1, weight: 1 }} />
            <Polygon positions={bufferZone} pathOptions={{ color: 'orange', fillOpacity: 0.1, weight: 1 }} />
            <Polygon positions={communityZone} pathOptions={{ color: 'red', fillOpacity: 0.1, weight: 1 }} />

            {/* Devices */}
            {devices.map((device) => (
                <Marker 
                    key={device.id} 
                    position={device.coordinates}
                    icon={device.type === "Camera" ? cameraIcon : sensorIcon}
                >
                    <Popup>
                        <div className="text-sm">
                            <strong>{device.id}</strong><br/>
                            Type: {device.type}<br/>
                            Status: <span className={device.status === "Online" ? "text-green-600" : "text-red-600"}>{device.status}</span><br/>
                            Battery: {device.battery}%
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Elephant */}
            <Marker position={elephantPos} icon={elephantIcon}>
                <Popup>Elephant Herd Detected</Popup>
            </Marker>

            {/* Predicted Path (Only in Scenario B) */}
            {simMode === "Scenario B: Critical Threat" && (
                 <Polyline 
                    positions={[elephantPos, [14.26, 101.46]]}
                    pathOptions={{ color: 'red', dashArray: '10, 10', weight: 4, opacity: 0.7 }}
                 />
            )}

            {/* Legend Overlay (Custom Control) */}
            <div className="leaflet-bottom leaflet-right m-4">
                <div className="bg-white p-3 rounded-lg shadow-lg text-xs">
                    <h4 className="font-bold mb-2">Zone Legend</h4>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500/20 border border-green-500"></div> Forest</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500/20 border border-orange-500"></div> Buffer</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/20 border border-red-500"></div> Community</div>
                </div>
            </div>
        </MapContainer>
    );
}