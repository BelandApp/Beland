import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BeCoinIcon } from "../icons/BeCoinIcon";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import {
  formatBeCoins,
  formatBeCoinsWithValue,
  BECOIN_CONFIG,
} from "../../constants";
import { colors } from "../../styles/colors";

interface BeCoinsBalanceProps {
  onPress?: () => void;
  style?: any;
  size?: "small" | "medium" | "large";
  variant?: "default" | "header"; // Nueva prop para el estilo del header
}

export const BeCoinsBalance: React.FC<BeCoinsBalanceProps> = ({
  onPress,
  style,
  size = "medium",
  variant = "default", // Valor por defecto
}) => {
  const { balance, getBeCoinsInUSD } = useBeCoinsStore();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container:
            variant === "header"
              ? styles.headerSmallContainer
              : styles.smallContainer,
          text:
            variant === "header" ? styles.headerSmallText : styles.smallText,
          value:
            variant === "header" ? styles.headerSmallValue : styles.smallValue,
          icon: 16,
        };
      case "large":
        return {
          container:
            variant === "header"
              ? styles.headerLargeContainer
              : styles.largeContainer,
          text:
            variant === "header" ? styles.headerLargeText : styles.largeText,
          value:
            variant === "header" ? styles.headerLargeValue : styles.largeValue,
          icon: 28,
        };
      default:
        return {
          container:
            variant === "header"
              ? styles.headerMediumContainer
              : styles.mediumContainer,
          text:
            variant === "header" ? styles.headerMediumText : styles.mediumText,
          value:
            variant === "header"
              ? styles.headerMediumValue
              : styles.mediumValue,
          icon: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      style={[sizeStyles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <BeCoinIcon width={sizeStyles.icon} height={sizeStyles.icon} />
      <View style={styles.textContainer}>
        <Text style={[styles.balanceText, sizeStyles.text]}>{balance}</Text>
        <Text style={[styles.valueText, sizeStyles.value]}>
          ${getBeCoinsInUSD().toFixed(2)} USD
        </Text>
      </View>
    </Component>
  );
};

const styles = {
  // Contenedores por tamaño
  smallContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mediumContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  largeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  textContainer: {
    marginLeft: 6,
  },

  balanceText: {
    fontWeight: "700" as const,
    color: "#1a1a1a", // Texto negro para mejor contraste
  },

  valueText: {
    fontWeight: "500" as const,
    color: "#666666", // Gris más oscuro para mejor legibilidad
  },

  // Textos por tamaño
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 18,
  },

  smallValue: {
    fontSize: 10,
  },
  mediumValue: {
    fontSize: 11,
  },
  largeValue: {
    fontSize: 13,
  },

  // Estilos para variante "header" (fondo naranja con texto blanco)
  headerSmallContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
    minWidth: 60,
  },
  headerMediumContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    minWidth: 80,
  },
  headerLargeContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    minWidth: 100,
  },

  // Textos para variante "header"
  headerSmallText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  headerMediumText: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  headerLargeText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },

  headerSmallValue: {
    fontSize: 10,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  headerMediumValue: {
    fontSize: 11,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
  headerLargeValue: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#FFFFFF",
  },
};
