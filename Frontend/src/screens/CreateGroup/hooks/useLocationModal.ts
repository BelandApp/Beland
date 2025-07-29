import { useState, useCallback } from "react";
import {
  detectCurrentLocation,
  requestLocationEnable,
} from "../../../utils/locationUtils";

interface LocationResult {
  address: string;
  error?: string;
}

export const useLocationModal = (
  onLocationFromMaps?: (location: string) => void
) => {
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationResult | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Manejar ubicaciones que vienen de Google Maps via deep link
  const handleLocationFromDeepLink = useCallback(
    (location: string) => {
      console.log("Ubicación recibida de Google Maps:", location);

      // Actualizar el estado local
      setCurrentLocation({ address: location });

      // Cerrar el modal si está abierto
      setShowLocationModal(false);

      // Llamar al callback si existe
      if (onLocationFromMaps) {
        onLocationFromMaps(location);
      }
    },
    [onLocationFromMaps]
  );

  const predefinedLocations = [
    "Palermo, CABA",
    "Villa Crespo, CABA",
    "Belgrano, CABA",
    "Caballito, CABA",
    "San Telmo, CABA",
    "Puerto Madero, CABA",
    "Recoleta, CABA",
    "Barracas, CABA",
  ];

  const getCurrentLocation = async (): Promise<LocationResult | null> => {
    try {
      setIsLoadingLocation(true);
      setCurrentLocation(null); // Limpiar ubicación anterior

      // Primero intentar habilitar ubicación si está desactivada (mostrará diálogo nativo)
      console.log("Intentando habilitar ubicación...");
      const locationEnabled = await requestLocationEnable();

      if (!locationEnabled) {
        const errorResult: LocationResult = {
          address: "",
          error: "Los servicios de ubicación están desactivados.",
        };
        setCurrentLocation(errorResult);
        return null;
      }

      const result = await detectCurrentLocation();

      if (result.success && result.address) {
        const locationResult: LocationResult = {
          address: result.address,
        };

        setCurrentLocation(locationResult);
        return locationResult;
      } else {
        // Manejar error específico
        const errorResult: LocationResult = {
          address: "",
          error: result.error || "No se pudo detectar tu ubicación",
        };
        setCurrentLocation(errorResult);
        return null;
      }
    } catch (error) {
      console.error("Error en useLocationModal:", error);
      const errorResult: LocationResult = {
        address: "",
        error: "Error inesperado al detectar ubicación",
      };
      setCurrentLocation(errorResult);
      return null;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Nota: openMapsForSelection fue removida ya que ahora usamos MapSelector

  return {
    // Estados
    showLocationModal,
    predefinedLocations,
    currentLocation,
    isLoadingLocation,

    // Setters
    setShowLocationModal,
    setCurrentLocation,

    // Funciones
    getCurrentLocation,
    // openMapsForSelection removida - ahora se usa MapSelector
  };
};
