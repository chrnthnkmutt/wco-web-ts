"use client";

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useSimulation } from "@/context/SimulationContext";
import L from "leaflet";
import { useEffect, useState } from "react";
import * as turf from "@turf/turf";

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

// Inner component to handle programmatic map moves and bounds
function MapController({ target, bounds }: { target?: [number, number] | null, bounds?: L.LatLngBoundsExpression | null }) {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 16, { animate: true, duration: 1.5 });
        }
    }, [target, map]);

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

interface MapComponentProps {
    flyToTarget?: [number, number] | null;
}

export default function MapComponent({ flyToTarget }: MapComponentProps) {
    const { elephantPos, devices, simMode } = useSimulation();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [forestGeo, setForestGeo] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bufferGeo, setBufferGeo] = useState<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [communityGeo, setCommunityGeo] = useState<any>(null);
    const [mapBounds, setMapBounds] = useState<L.LatLngBoundsExpression | null>(null);

    useEffect(() => {
        const fetchKml = async () => {
            try {
                const response = await fetch('/map/Wongkot_Cave.kml');
                const text = await response.text();
                
                // Simple parsing logic for KML coordinates
                const coordMatch = text.match(/<coordinates>([\s\S]*?)<\/coordinates>/);
                if (coordMatch && coordMatch[1]) {
                    const rawCoords = coordMatch[1].trim().split(/\s+/);
                    const coords = rawCoords.map(c => {
                        const parts = c.split(',');
                        // KML is lon,lat,alt. Turf expects lon,lat.
                        return [parseFloat(parts[0]), parseFloat(parts[1])];
                    });

                    // Ensure the polygon is closed (first and last points must be the same)
                    if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
                        coords.push(coords[0]);
                    }

                    const forestPoly = turf.polygon([coords]);
                    setForestGeo(forestPoly);

                    // Calculate Bounds
                    const bbox = turf.bbox(forestPoly);
                    // bbox is [minX, minY, maxX, maxY] (lon, lat)
                    // Leaflet bounds are [[lat1, lon1], [lat2, lon2]]
                    setMapBounds([[bbox[1], bbox[0]], [bbox[3], bbox[2]]]);

                    // Calculate Zones
                    // Buffer: 1km from forest
                    const bufferPoly = turf.buffer(forestPoly, 1, { units: 'kilometers' });
                    setBufferGeo(bufferPoly);

                    // Community: 1km from Buffer (Total 2km from forest)
                    const communityPoly = turf.buffer(forestPoly, 2, { units: 'kilometers' });
                    setCommunityGeo(communityPoly);
                }
            } catch (error) {
                console.error("Error loading map KML:", error);
            }
        };

        fetchKml();
    }, []);

    return (
        <MapContainer 
            center={[12.87, 101.81]} 
            zoom={13} 
            scrollWheelZoom={true} 
            className="h-full w-full rounded-xl z-0"
        >
            <MapController target={flyToTarget} bounds={mapBounds} />
            
            <TileLayer
                attribution='&copy; Google Maps'
                url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
            />

            {/* Zones - Rendered strictly from largest to smallest for layering */}
            {communityGeo && (
                <GeoJSON 
                    data={communityGeo} 
                    style={{ color: 'red', fillColor: 'red', fillOpacity: 0.1, weight: 1 }} 
                />
            )}
            {bufferGeo && (
                <GeoJSON 
                    data={bufferGeo} 
                    style={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.2, weight: 1 }} 
                />
            )}
            {forestGeo && (
                <GeoJSON 
                    data={forestGeo} 
                    style={{ color: 'green', fillColor: 'green', fillOpacity: 0.3, weight: 1 }} 
                />
            )}

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
                    positions={[elephantPos, [12.85, 101.83]]} 
                    pathOptions={{ color: 'red', dashArray: '10, 10', weight: 4, opacity: 0.7 }}
                 />
            )}

            {/* Legend Overlay (Custom Control) */}
            <div className="leaflet-bottom leaflet-right m-4">
                <div className="bg-white p-3 rounded-lg shadow-lg text-xs">
                    <h4 className="font-bold mb-2">Zone Legend</h4>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500/30 border border-green-500"></div> Forest</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500/20 border border-orange-500"></div> Buffer (1km)</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500/10 border border-red-500"></div> Community (2km)</div>
                </div>
            </div>
        </MapContainer>
    );
}