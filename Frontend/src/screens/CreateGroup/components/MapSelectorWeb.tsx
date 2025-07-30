import React, { useState, useRef } from "react";
import { Platform } from "react-native";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface MapSelectorWebProps {
  visible: boolean;
  onLocationSelect: (
    location: string,
    coordinates?: { lat: number; lng: number }
  ) => void;
  onClose: () => void;
}

// Componente para web: usa el API de geolocalización y Leaflet directamente
export const MapSelectorWeb: React.FC<MapSelectorWebProps> = ({
  visible,
  onLocationSelect,
  onClose,
}) => {
  const [selectedPosition, setSelectedPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Icono personalizado para el marcador
  const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  // Obtener ubicación actual del usuario
  const handleDetectLocation = () => {
    setLoading(true);
    setError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setSelectedPosition({ lat: latitude, lng: longitude });
          fetchAddress(latitude, longitude);
          setLoading(false);
        },
        (err) => {
          setError("No se pudo obtener la ubicación actual");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocalización no soportada");
      setLoading(false);
    }
  };

  // Buscar dirección por coordenadas
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setSelectedAddress(data.display_name || "Ubicación seleccionada");
    } catch {
      setSelectedAddress("Ubicación seleccionada");
    }
  };

  // Componente para manejar clics en el mapa
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setSelectedPosition(e.latlng);
        fetchAddress(e.latlng.lat, e.latlng.lng);
      },
    });
    return selectedPosition ? (
      <Marker position={selectedPosition} icon={markerIcon} />
    ) : null;
  }

  // Solo renderizar en web
  if (!visible || Platform.OS !== "web") return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "#fff",
        zIndex: 9999,
        fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <div
        style={{
          padding: 24,
          background: "#667eea",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 0.5 }}>
          🗺️ Selector de Mapa
        </span>
        <button
          onClick={onClose}
          style={{
            fontSize: 20,
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✕
        </button>
      </div>
      <div
        style={{
          padding: 16,
          fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <button
            onClick={handleDetectLocation}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "10px 20px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🛰️ Detectar mi ubicación
          </button>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.target as any).elements.manualAddress.value;
              if (!input.trim()) return;
              try {
                setLoading(true);
                setError("");
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    input
                  )}`
                );
                const results = await res.json();
                if (results && results.length > 0) {
                  const result = results[0];
                  setSelectedPosition({
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                  });
                  setSelectedAddress(result.display_name);
                  setError("");
                } else {
                  setError("No se encontró la dirección ingresada.");
                }
              } catch {
                setError("Error buscando la dirección.");
              } finally {
                setLoading(false);
              }
            }}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <input
              name="manualAddress"
              type="text"
              placeholder="Ingresá tu dirección o lugar..."
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ccc",
                fontSize: 17,
                outline: "none",
                width: 220,
                fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
              autoComplete="off"
            />
            <button
              type="submit"
              style={{
                background: "#667eea",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 16px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
                fontSize: 16,
              }}
            >
              Buscar
            </button>
          </form>
        </div>
        {error && (
          <div style={{ color: "#e53e3e", marginBottom: 8 }}>{error}</div>
        )}
        {selectedAddress && (
          <div
            style={{
              color: "#667eea",
              fontWeight: 500,
              marginBottom: 8,
              fontSize: 17,
              background: "#f3f3ff",
              borderRadius: 10,
              padding: "8px 12px",
              fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
            }}
          >
            📍 {selectedAddress}
          </div>
        )}
        <div
          style={{
            height: "60vh",
            width: "100%",
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
            marginBottom: 12,
          }}
        >
          <MapContainer
            key={
              selectedPosition
                ? `${selectedPosition.lat},${selectedPosition.lng}`
                : "default"
            }
            center={selectedPosition || { lat: -34.6037, lng: -58.3816 }}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution="© OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {selectedPosition && (
              <Marker position={selectedPosition} icon={markerIcon} />
            )}
            <LocationMarker />
          </MapContainer>
        </div>
        <button
          disabled={!selectedPosition}
          onClick={() => {
            if (selectedPosition) {
              onLocationSelect(selectedAddress, selectedPosition);
              onClose();
            }
          }}
          style={{
            background: selectedPosition
              ? "linear-gradient(135deg, #4CAF50 0%, #45a049 100%)"
              : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: 20,
            padding: "12px 24px",
            fontWeight: 700,
            cursor: selectedPosition ? "pointer" : "not-allowed",
            marginTop: 8,
            fontSize: 18,
            boxShadow: selectedPosition
              ? "0 2px 8px rgba(76,175,80,0.15)"
              : "none",
            fontFamily: "Segoe UI, Roboto, Arial, sans-serif",
            letterSpacing: 0.2,
          }}
        >
          ✓ Confirmar ubicación
        </button>
      </div>
    </div>
  );
};
