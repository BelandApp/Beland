import * as Location from "expo-location";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform, Alert, Linking } from "react-native";
import { UserLocation } from "../types/recycling";

export class LocationService {
  static async getCurrentLocation(): Promise<UserLocation | null> {
    try {
      console.log("🌍 Solicitando permisos de ubicación...");

      // Verificar si el servicio de ubicación está habilitado
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        console.log(
          "ℹ️ GPS deshabilitado - Se mostrará diálogo nativo para habilitar"
        );
        throw new Error("GPS_DISABLED");
      }

      // Solicitar permisos
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("📋 Estado de permisos:", status);

      if (status !== "granted") {
        console.log("❌ Permisos de ubicación denegados");
        throw new Error("PERMISSION_DENIED");
      }

      console.log("✅ Permisos concedidos, obteniendo ubicación...");

      // Obtener ubicación actual
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log("📍 Ubicación obtenida:", location.coords);

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 100,
      };
    } catch (error: any) {
      console.log("ℹ️ Detectando estado de ubicación:", error);

      // Manejar diferentes tipos de error
      if (
        error.code === "E_LOCATION_SETTINGS_UNSATISFIED" ||
        error.message?.includes("unsatisfied device settings")
      ) {
        throw new Error("GPS_SETTINGS_UNSATISFIED");
      } else if (error.code === "E_LOCATION_UNAVAILABLE") {
        throw new Error("GPS_UNAVAILABLE");
      } else if (error.message === "GPS_DISABLED") {
        throw new Error("GPS_DISABLED");
      } else if (error.message === "PERMISSION_DENIED") {
        throw new Error("PERMISSION_DENIED");
      }

      throw new Error("UNKNOWN_ERROR");
    }
  }

  static async enableLocationServices(): Promise<boolean> {
    try {
      console.log("🛠️ Intentando mostrar diálogo nativo de ubicación...");

      // Verificar si ya están habilitados
      const enabled = await Location.hasServicesEnabledAsync();
      if (enabled) {
        console.log("✅ Servicios de ubicación ya están habilitados");
        return true;
      }

      console.log("📱 Forzando diálogo nativo mediante getCurrentPosition...");

      // Forzar el diálogo nativo intentando obtener ubicación directamente
      // Esto automáticamente mostrará el diálogo nativo de Android para habilitar ubicación
      try {
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // Si llegamos aquí, significa que se habilitó correctamente
        console.log("✅ Ubicación habilitada mediante diálogo nativo");
        return true;
      } catch (locationError: any) {
        console.log(
          "ℹ️ Proceso de activación completado, verificando resultado..."
        );

        // Después del diálogo, verificar si los servicios se habilitaron
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const nowEnabled = await Location.hasServicesEnabledAsync();
        console.log("🔄 Estado después de diálogo nativo:", nowEnabled);
        return nowEnabled;
      }
    } catch (error) {
      console.error("🚨 Error con diálogo nativo:", error);

      // Verificación final
      try {
        const finalEnabled = await Location.hasServicesEnabledAsync();
        console.log("🔄 Verificación final:", finalEnabled);
        return finalEnabled;
      } catch {
        return false;
      }
    }
  }

  static async forceRealLocation(): Promise<UserLocation | null> {
    try {
      console.log("🚀 Forzando ubicación GPS real...");

      // Verificar que el GPS esté habilitado
      let enabled = await Location.hasServicesEnabledAsync();
      console.log("📡 GPS habilitado:", enabled);

      if (!enabled) {
        console.log("❌ GPS no está habilitado");
        return null;
      }

      // Solicitar permisos con fuerza
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("❌ Permisos denegados para GPS real");
        return null;
      }

      console.log("✅ Obteniendo ubicación GPS de alta precisión...");

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      console.log("🎯 GPS real exitoso:", location.coords);

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || 100,
      };
    } catch (error) {
      console.error("💥 Error GPS real:", error);
      return null;
    }
  }

  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  static async requestLocationPermission(): Promise<boolean> {
    try {
      console.log("🔐 Solicitando permisos de ubicación...");

      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log("📋 Estado de permisos:", status);

      return status === "granted";
    } catch (error) {
      console.error("🚨 Error solicitando permisos:", error);
      return false;
    }
  }

  static async hasLocationPermission(): Promise<boolean> {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("🚨 Error verificando permisos:", error);
      return false;
    }
  }

  private static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
