export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface RecyclingPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  acceptedWasteTypes: string[];
  openingHours?: string;
  phone?: string;
  website?: string;
  distance?: number;
}

export interface RecyclingType {
  id: string;
  name: string;
  emoji: string;
  color: string;
}
