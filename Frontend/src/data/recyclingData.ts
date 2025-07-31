import { RecyclingPoint, RecyclingType } from "../types/recycling";

export const RECYCLING_TYPES: RecyclingType[] = [
  {
    id: "plastic",
    name: "Plástico",
    emoji: "♻️",
    color: "#22C55E",
  },
  {
    id: "paper",
    name: "Papel",
    emoji: "📄",
    color: "#3B82F6",
  },
  {
    id: "electronics",
    name: "Electrónicos",
    emoji: "🔌",
    color: "#EF4444",
  },
  {
    id: "glass",
    name: "Vidrio",
    emoji: "🍾",
    color: "#8B5CF6",
  },
  {
    id: "organic",
    name: "Orgánico",
    emoji: "🍃",
    color: "#F59E0B",
  },
];

export const MOCK_RECYCLING_POINTS: RecyclingPoint[] = [
  {
    id: "1",
    name: "Punto Palermo",
    address: "Av. Córdoba 3500, Palermo",
    latitude: -34.5906,
    longitude: -58.4069,
    acceptedWasteTypes: ["plastic", "paper", "electronics"],
  },
  {
    id: "2",
    name: "EcoPunto Recoleta",
    address: "Av. Las Heras 2500, Recoleta",
    latitude: -34.5875,
    longitude: -58.3974,
    acceptedWasteTypes: ["plastic", "glass"],
  },
  {
    id: "3",
    name: "Centro Verde Belgrano",
    address: "Av. Cabildo 2800, Belgrano",
    latitude: -34.5631,
    longitude: -58.4553,
    acceptedWasteTypes: ["plastic", "paper", "glass", "organic"],
  },
  {
    id: "4",
    name: "Punto Verde Villa Crespo",
    address: "Av. Corrientes 4500, Villa Crespo",
    latitude: -34.5998,
    longitude: -58.4372,
    acceptedWasteTypes: ["electronics", "glass"],
  },
  {
    id: "5",
    name: "Estación Sustentable Caballito",
    address: "Av. Rivadavia 5200, Caballito",
    latitude: -34.6118,
    longitude: -58.4394,
    acceptedWasteTypes: ["plastic", "paper", "organic"],
  },
];
