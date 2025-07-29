import * as Location from "expo-location";

export interface LocationResult {
  success: boolean;
  address?: string;
  error?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Función para detectar ubicación actual con GPS
export const detectCurrentLocation = async (): Promise<LocationResult> => {
  try {
    console.log("Iniciando detección de ubicación...");

    // Verificar si los servicios de ubicación están habilitados
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      try {
        // Intentar habilitar los servicios de ubicación automáticamente (Android)
        console.log("Intentando habilitar servicios de ubicación...");
        await Location.enableNetworkProviderAsync();
        console.log("Servicios de ubicación habilitados exitosamente");
      } catch (enableError) {
        console.log("No se pudo habilitar automáticamente:", enableError);
        return {
          success: false,
          error:
            "Los servicios de ubicación están desactivados. Por favor, actívalos en configuración.",
        };
      }
    }

    // Solicitar permisos de ubicación
    console.log("Solicitando permisos de ubicación...");
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      return {
        success: false,
        error:
          "La aplicación necesita acceso a la ubicación. Por favor, permite el acceso en configuración.",
      };
    }

    console.log("Permisos concedidos, obteniendo ubicación...");

    // Obtener ubicación actual con configuración optimizada
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Cambiar de High a Balanced para mejor rendimiento
    });

    console.log("Ubicación obtenida:", location.coords);

    // Geocodificación inversa para obtener la dirección
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    console.log("Geocodificación inversa:", reverseGeocode);

    if (reverseGeocode && reverseGeocode.length > 0) {
      const address = reverseGeocode[0];

      // Crear una dirección más legible
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.streetNumber) parts.push(address.streetNumber);
      if (address.city) parts.push(address.city);
      if (address.region) parts.push(address.region);

      const formattedAddress = parts.join(", ") || "Ubicación detectada";

      console.log("Dirección formateada:", formattedAddress);

      return {
        success: true,
        address: formattedAddress,
        coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      };
    } else {
      // Si no se puede obtener la dirección, usar las coordenadas
      const coordinatesAddress = `Lat: ${location.coords.latitude.toFixed(
        4
      )}, Lng: ${location.coords.longitude.toFixed(4)}`;

      return {
        success: true,
        address: coordinatesAddress,
        coordinates: {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        },
      };
    }
  } catch (error: any) {
    console.error("Error detecting location:", error);

    // Manejo específico de errores comunes
    if (error.code === "E_LOCATION_SETTINGS_UNSATISFIED") {
      return {
        success: false,
        error: "El GPS está desactivado. Por favor, actívalo en configuración.",
      };
    }

    if (error.code === "E_LOCATION_TIMEOUT") {
      return {
        success: false,
        error:
          "Tiempo de espera agotado. Verifica tu conexión y que estés en un área con buena señal GPS.",
      };
    }

    if (error.code === "E_LOCATION_UNAVAILABLE") {
      return {
        success: false,
        error:
          "Ubicación no disponible. Asegúrate de estar en un lugar con acceso a GPS.",
      };
    }

    return {
      success: false,
      error:
        "Error al detectar ubicación. Verifica que el GPS esté activado y tengas conexión.",
    };
  }
};

// Función para obtener sugerencias de ubicación (simulada - en producción usar Google Places API)
export const fetchLocationSuggestions = async (
  query: string
): Promise<string[]> => {
  if (query.length < 3) {
    return [];
  }

  try {
    // Simulación de API de Google Places
    const mockSuggestions = [
      `${query}, Buenos Aires, Argentina`,
      `${query}, CABA, Argentina`,
      `${query}, Palermo, CABA`,
      `${query}, Villa Crespo, CABA`,
      `${query}, Belgrano, CABA`,
    ].filter((suggestion) =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );

    // Simular delay de API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockSuggestions);
      }, 300);
    });

    // Para usar la API real de Google Places, reemplazar con:
    /*
    const GOOGLE_PLACES_API_KEY = 'TU_API_KEY_AQUI';
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${GOOGLE_PLACES_API_KEY}&components=country:ar`
    );
    const data = await response.json();
    
    if (data.predictions) {
      return data.predictions.map((prediction: any) => prediction.description);
    }
    return [];
    */
  } catch (error) {
    console.error("Error fetching location suggestions:", error);
    return [];
  }
};

// Función específica para solicitar habilitación de ubicación con diálogo nativo
export const requestLocationEnable = async (): Promise<boolean> => {
  try {
    console.log("Verificando servicios de ubicación...");

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (servicesEnabled) {
      console.log("Los servicios de ubicación ya están habilitados");
      return true;
    }

    console.log(
      "Los servicios están desactivados, mostrando diálogo nativo de Android..."
    );

    // Esta función muestra el diálogo nativo de Android para habilitar ubicación
    await Location.enableNetworkProviderAsync();

    // Verificar si realmente se habilitó
    const newStatus = await Location.hasServicesEnabledAsync();
    console.log(
      "Estado después de mostrar diálogo nativo:",
      newStatus ? "HABILITADO" : "SIGUE DESHABILITADO"
    );

    return newStatus;
  } catch (error) {
    console.log("Error al solicitar habilitación de ubicación:", error);
    return false;
  }
};

// Nota: La función openGoogleMapsForSelection fue removida
// ya que ahora usamos MapSelector para selección automática de ubicación
