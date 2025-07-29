import { useState } from "react";
import { UserLocation } from "src/types/recycling";
import { LocationService } from "@services/locationService";

export const useUserLocation = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  const getUserLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      setUserLocation({
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 100,
      });
    }
  };

  return { userLocation, getUserLocation };
};
