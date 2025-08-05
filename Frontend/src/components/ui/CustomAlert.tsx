import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { colors } from "../../styles/colors";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: "success" | "error" | "info";
  autoCloseDelay?: number; // Nuevo: tiempo en ms para cerrar automáticamente
  primaryButton?: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
}

export const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
  type = "info",
  autoCloseDelay,
  primaryButton,
  secondaryButton,
}: CustomAlertProps) => {
  // Efecto para cerrar automáticamente
  useEffect(() => {
    if (visible && autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseDelay, onClose]);
  const getIconByType = () => {
    switch (type) {
      case "success":
        return "🎉";
      case "error":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  const getColorByType = () => {
    switch (type) {
      case "success":
        return colors.belandGreen;
      case "error":
        return colors.error;
      default:
        return colors.belandOrange;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View
            style={[styles.iconContainer, { borderColor: getColorByType() }]}
          >
            <Text style={[styles.icon, { color: getColorByType() }]}>
              {getIconByType()}
            </Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Solo mostrar botones si no hay autoClose o si hay botones definidos */}
          {(!autoCloseDelay || primaryButton || secondaryButton) && (
            <View style={styles.buttonContainer}>
              {secondaryButton && (
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={secondaryButton.onPress}
                >
                  <Text style={styles.secondaryButtonText}>
                    {secondaryButton.text}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: getColorByType() },
                  !secondaryButton && { flex: 0, minWidth: 120 }, // Si es un solo botón, centrado
                ]}
                onPress={primaryButton?.onPress || onClose}
              >
                <Text style={styles.buttonText}>
                  {primaryButton?.text || "OK"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    maxWidth: Dimensions.get("window").width - 40,
    width: "100%",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
  primaryButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  secondaryButton: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  secondaryButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
