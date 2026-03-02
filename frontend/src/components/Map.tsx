"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, ZoomControl } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icon in leaflet with Next.js
const setupLeafletIcons = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
};

// Center for Tamil Nadu
const TAMIL_NADU_CENTER: [number, number] = [11.1271, 78.6569];

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.setView(center);
        }
    }, [center, map]);
    return null;
}

export default function Map({
    center = TAMIL_NADU_CENTER,
    zoom = 7,
    pickupCoords,
    destinationCoords,
    trackProgress = 0
}: {
    center?: [number, number],
    zoom?: number,
    pickupCoords?: [number, number],
    destinationCoords?: [number, number],
    trackProgress?: number
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [routePath, setRoutePath] = useState<[number, number][]>([]);

    useEffect(() => {
        setupLeafletIcons();
        setIsMounted(true);
    }, []);

    // Fetch route from OSRM
    useEffect(() => {
        if (pickupCoords && destinationCoords) {
            const fetchRoute = async () => {
                try {
                    // OSRM expects [lon, lat]
                    const url = `https://router.project-osrm.org/base/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`;
                    const res = await fetch(url.replace('/base/', '/route/')); // Safer endpoint
                    const data = await res.json();
                    if (data.code === 'Ok' && data.routes?.length > 0) {
                        const coordinates = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                        setRoutePath(coordinates);
                    } else {
                        // Fallback to straight line if OSRM fails
                        setRoutePath([pickupCoords, destinationCoords]);
                    }
                } catch (err) {
                    console.error("Routing error:", err);
                    setRoutePath([pickupCoords, destinationCoords]);
                }
            };
            fetchRoute();
        } else {
            setRoutePath([]);
        }
    }, [pickupCoords, destinationCoords]);

    if (!isMounted) return (
        <div className="w-full h-full bg-gray-100 animate-pulse flex flex-col items-center justify-center gap-4">
            <div className="text-gray-400 font-black text-[10px] uppercase tracking-[4px]">Initializing Map Engine</div>
            <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-accent animate-progress w-1/2"></div>
            </div>
        </div>
    );

    const routeOptions = { color: '#000000', weight: 5, opacity: 0.9 };

    let carPosition: [number, number] | null = null;
    if (routePath.length > 0) {
        const targetIndex = Math.min(
            routePath.length - 1,
            Math.floor((trackProgress / 100) * (routePath.length - 1))
        );
        carPosition = routePath[targetIndex];
    }

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                key={pickupCoords ? `map-${pickupCoords[0]}-${pickupCoords[1]}` : 'map-default'}
                center={pickupCoords || center}
                zoom={zoom}
                scrollWheelZoom={true}
                zoomControl={false} // Disable default to avoid appendChild error on rapid remount
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Add Zoom control manually after mount */}
                <ZoomControl position="bottomright" />

                {pickupCoords && (
                    <Marker position={pickupCoords}>
                        <Popup>Pickup Location</Popup>
                    </Marker>
                )}

                {destinationCoords && (
                    <Marker position={destinationCoords}>
                        <Popup>Destination</Popup>
                    </Marker>
                )}

                {routePath.length > 0 && (
                    <Polyline positions={routePath} pathOptions={routeOptions} />
                )}

                {carPosition && (
                    <Marker position={carPosition}>
                        <Popup>Your Captain</Popup>
                    </Marker>
                )}

                <MapUpdater center={pickupCoords || center} />
            </MapContainer>
        </div>
    );
}
