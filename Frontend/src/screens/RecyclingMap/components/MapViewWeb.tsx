import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix para los iconos por defecto de Leaflet en web (evita error de recursos locales)
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface RecyclingPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isSelected?: boolean;
  isNearest?: boolean;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MapViewWebProps {
  userLocation: UserLocation | null;
  points: RecyclingPoint[];
  selectedPointId: string | null;
  onSelectPoint?: (id: string) => void;
}

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

const recyclingIcon = new L.DivIcon({
  html: '<div style="background:#22C55E;width:24px;height:24px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">♻️</div>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapCenter({
  lat,
  lng,
  zoom,
}: {
  lat: number;
  lng: number;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
}

export const MapViewWeb: React.FC<MapViewWebProps> = ({
  userLocation,
  points,
  selectedPointId,
  onSelectPoint,
}) => {
  const mapRef = useRef<any>(null);
  const center = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : [-34.6037, -58.3816];
  const zoom = selectedPointId ? 15 : 13;
  const selectedPoint = points.find((p) => p.id === selectedPointId);
  const centerLat = selectedPoint ? selectedPoint.latitude : center[0];
  const centerLng = selectedPoint ? selectedPoint.longitude : center[1];

  return (
    <div
      style={{
        display: "flex",
        height: "800px",
        maxWidth: "1200px",
        margin: "0 auto",
        background: "#f8fafc",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 12px #0001",
      }}
    >
      <div style={{ flex: 2, minWidth: 0 }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
          scrollWheelZoom={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <style>{`
            .leaflet-control-layers-toggle {
              background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/layers.png');
            }
            .leaflet-retina .leaflet-control-layers-toggle {
              background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/layers-2x.png');
              background-size: 26px 26px;
            }
            .leaflet-touch .leaflet-control-layers-toggle {
              background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/layers.png');
            }
            .leaflet-default-icon-path {
              background-image: url('https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png');
            }
          `}</style>
          {userLocation && (
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>Tu ubicación</Popup>
            </Marker>
          )}
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={recyclingIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectPoint) onSelectPoint(point.id);
                },
              }}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                <small>{point.address}</small>
                {point.isNearest && (
                  <span style={{ color: "#F88D2A", fontWeight: "bold" }}>
                    Más cercano
                  </span>
                )}
              </Popup>
            </Marker>
          ))}
          <MapCenter lat={centerLat} lng={centerLng} zoom={zoom} />
        </MapContainer>
      </div>
    </div>
  );
};
