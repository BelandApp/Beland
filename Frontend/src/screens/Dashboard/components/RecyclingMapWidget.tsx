import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { colors } from "../../../styles";
import { LocationService } from "../../../services/locationService";
import { PhoneMapSVG } from "../../../components/icons/PhoneMapSVG";
import { PhoneMapSVGWeb } from "../../../components/icons/PhoneMapSVGWeb";
import { MiniMapContent } from "./MiniMapContent";
import { MiniMapContentWeb } from "./MiniMapContentWeb";
import { ConfirmationAlert } from "../../../components/ui/ConfirmationAlert";

interface RecyclingMapWidgetProps {
  onPress?: () => void;
}

export const RecyclingMapWidget: React.FC<RecyclingMapWidgetProps> = ({
  onPress,
}) => {
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const handlePress = async () => {
    if (Platform.OS === "web") {
      // En web, solo ejecuta onPress (la navegación la maneja el contenedor)
      onPress?.();
      return;
    }

    // --- MOBILE: Validación completa de permisos y errores ---
    try {
      // Verificar si ya tiene permisos
      const hasPermission = await LocationService.hasLocationPermission();

      if (hasPermission) {
        // Si ya tiene permisos, intentar obtener ubicación y navegar
        try {
          await LocationService.getCurrentLocation();
          onPress?.();
        } catch (locationError: any) {
          // Manejar errores específicos de ubicación
          handleLocationError(locationError);
        }
        return;
      }

      // Si no tiene permisos, solicitarlos
      const permissionGranted =
        await LocationService.requestLocationPermission();

      if (permissionGranted) {
        // Si otorgó permisos, intentar obtener ubicación y navegar
        try {
          await LocationService.getCurrentLocation();
          onPress?.();
        } catch (locationError: any) {
          handleLocationError(locationError);
        }
      } else {
        // Si no otorgó permisos, mostrar alerta
        Alert.alert(
          "Permisos de ubicación",
          "Para encontrar los puntos de reciclaje más cercanos, necesitamos acceso a tu ubicación.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Configurar",
              onPress: () => {
                Alert.alert(
                  "Por favor, habilita los permisos de ubicación en la configuración de la app."
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error al solicitar permisos de ubicación:", error);
      Alert.alert(
        "Error",
        "Hubo un problema al acceder a la ubicación. Por favor, intenta nuevamente."
      );
    }
  };

  const handleLocationError = (error: any) => {
    const errorMessage = error.message;

    switch (errorMessage) {
      case "GPS_DISABLED":
        // GPS deshabilitado - mostrar diálogo nativo automáticamente
        console.log("📱 GPS deshabilitado, activando diálogo nativo...");
        handleNativeLocationEnable();
        break;

      case "GPS_SETTINGS_UNSATISFIED":
        // Configuración insatisfecha - mostrar diálogo nativo automáticamente
        console.log(
          "⚙️ Configuración GPS requerida, activando diálogo nativo..."
        );
        handleNativeLocationEnable();
        break;

      case "GPS_UNAVAILABLE":
        Alert.alert(
          "GPS No Disponible",
          "No se puede acceder al GPS en este momento. ¿Quieres ver el mapa sin ubicación exacta?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ver Mapa", onPress: () => onPress?.() },
          ]
        );
        break;

      case "PERMISSION_DENIED":
        Alert.alert(
          "Permisos Denegados",
          "Se necesitan permisos de ubicación para esta función.",
          [{ text: "OK", style: "default" }]
        );
        break;

      default:
        Alert.alert(
          "Error de Ubicación",
          "Hubo un problema con la ubicación. ¿Quieres ver el mapa de todas formas?",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Ver Mapa", onPress: () => onPress?.() },
          ]
        );
        break;
    }
  };

  const handleNativeLocationEnable = async () => {
    try {
      // Esto mostrará automáticamente el diálogo nativo de Android
      console.log("🔄 Iniciando proceso de activación de GPS...");
      const enabled = await LocationService.enableLocationServices();

      if (enabled) {
        // Si se habilitó, continuar con el flujo normal
        console.log("✅ GPS activado exitosamente, navegando al mapa...");
        onPress?.();
      } else {
        // Si no se habilitó, mostrar alert personalizado
        console.log("ℹ️ GPS no activado, ofreciendo alternativas...");
        setShowLocationAlert(true);
      }
    } catch (error) {
      console.log("⚠️ Error en proceso de activación GPS:", error);
      setShowErrorAlert(true);
    }
  };

  const renderMapContent = () => {
    if (Platform.OS === "web") {
      return (
        <PhoneMapSVGWeb width={300} height={300}>
          <MiniMapContentWeb />
        </PhoneMapSVGWeb>
      );
    }

    return (
      <PhoneMapSVG width={120} height={120}>
        <MiniMapContent />
      </PhoneMapSVG>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Encuentra el punto de canje más cercano</Text>
      <Text style={styles.subtitle}>
        Localiza puntos de reciclaje cerca de ti y contribuye al medio ambiente
      </Text>

      <TouchableOpacity style={styles.mapButton} onPress={handlePress}>
        <View style={styles.phoneContainer}>{renderMapContent()}</View>

        <View style={styles.actionArea}>
          <Text style={styles.actionText}>
            {Platform.OS === "web"
              ? "Mejor experiencia en móvil"
              : "Tocar para activar GPS y ver mapa detallado"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Alert personalizado para ubicación */}
      <ConfirmationAlert
        visible={showLocationAlert}
        title="Ubicación Deshabilitada"
        message="No se pudo activar el GPS. ¿Quieres ver el mapa sin ubicación exacta? Podrás explorar los puntos de reciclaje disponibles."
        confirmText="Ver Mapa"
        cancelText="Cancelar"
        type="info"
        icon="📍"
        onConfirm={() => {
          setShowLocationAlert(false);
          onPress?.();
        }}
        onCancel={() => setShowLocationAlert(false)}
      />

      {/* Alert personalizado para errores */}
      <ConfirmationAlert
        visible={showErrorAlert}
        title="Error de Ubicación"
        message="Hubo un problema al acceder a la ubicación. ¿Quieres ver el mapa de todas formas?"
        confirmText="Ver Mapa"
        cancelText="Reintentar"
        type="warning"
        icon="⚠️"
        onConfirm={() => {
          setShowErrorAlert(false);
          onPress?.();
        }}
        onCancel={() => setShowErrorAlert(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  mapButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
  },
  phoneContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    backgroundColor: "#F0F9FF",
  },
  actionArea: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    alignItems: "center",
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
