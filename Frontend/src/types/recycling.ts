/**
 * Tipos para el sistema de reciclaje y mapas
 */

export interface RecyclingPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  acceptedWasteTypes: string[]; // IDs de los tipos de residuos aceptados
  distance?: number; // en metros
  isClosest?: boolean;
}

export interface RecyclingType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
