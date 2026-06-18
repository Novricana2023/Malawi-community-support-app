"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapPoint {
  id: number;
  report_number: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  latitude: number;
  longitude: number;
  location: string;
}

const urgencyColors: Record<string, string> = {
  emergency: "#DC2626",
  high: "#EA580C",
  normal: "#2D6A4F",
};

function createIcon(urgency: string) {
  const color = urgencyColors[urgency] || "#2D6A4F";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function CommunityMap({ data }: { data: Record<string, unknown>[] }) {
  const points = data as unknown as MapPoint[];
  const center: [number, number] = points.length > 0
    ? [points[0].latitude, points[0].longitude]
    : [-13.9626, 33.7741];

  return (
    <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          icon={createIcon(point.urgency)}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-bold">{point.report_number}</p>
              <p>{point.title}</p>
              <p className="text-gray-500">{point.location}</p>
              <p className="capitalize mt-1">{point.urgency} · {point.status.replace(/_/g, " ")}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
