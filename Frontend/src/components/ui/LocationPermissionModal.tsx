import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { colors } from "../../styles";

interface LocationPermissionModalProps {
  visible: boolean;
  onAllow: () => void;
  onCancel: () => void;
}

const { width } = Dimensions.get("window");

export const LocationPermissionModal: React.FC<
  LocationPermissionModalProps
> = ({ visible, onAllow, onCancel }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* SVG Image placeholder - aquí iría la imagen SVG */}
          <View style={styles.imageContainer}>
            <View style={styles.recyclingMachine}>
              <Text style={styles.machineEmoji}>♻️</Text>
              <Text style={styles.machineText}>Máquina de Reciclaje</Text>
            </View>
          </View>

          <Text style={styles.title}>
            Encuentra puntos de reciclaje cerca de ti
          </Text>

          <Text style={styles.description}>
            Para mostrarte los puntos de reciclaje más cercanos y calcular
            distancias precisas, necesitamos acceso a tu ubicación.
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📍</Text>
              <Text style={styles.benefitText}>
                Puntos cercanos a tu ubicación
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>📏</Text>
              <Text style={styles.benefitText}>
                Distancias exactas calculadas
              </Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🗺️</Text>
              <Text style={styles.benefitText}>Navegación optimizada</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.allowButton} onPress={onAllow}>
              <Text style={styles.allowButtonText}>Permitir Ubicación</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Usar Sin Ubicación</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  imageContainer: {
    marginBottom: 20,
  },
  recyclingMachine: {
    alignItems: "center",
    backgroundColor: colors.belandGreenLight,
    padding: 20,
    borderRadius: 15,
    width: 120,
    height: 120,
    justifyContent: "center",
  },
  machineEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  machineText: {
    fontSize: 12,
    color: colors.belandGreen,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  benefits: {
    width: "100%",
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  allowButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  allowButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
});
