import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const recyclingCardStyles = StyleSheet.create({
  recyclingCard: {
    padding: 20,
  },
  recyclingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // Permite que los hijos bajen si no hay espacio
  },
  recyclingLeft: {
    flexDirection: "row",
    alignItems: Platform.OS === "web" ? "flex-start" : "center",
    gap: 16,
    flex: 1,
    flexWrap: "wrap", // Permite que el texto baje debajo del icono si no hay espacio
    minWidth: 0, // Permite que el texto se reduzca en móvil
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  recyclingTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  recyclingStats: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
    flexWrap: "wrap",
    maxWidth: Platform.OS === "web" ? 600 : "100%", // 100% en móvil
    flex: 1,
    minWidth: 0,
  },
  recyclingNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.belandGreen,
  },
  recyclingLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: Platform.OS === "web" ? "left" : "center",
    width: "100%",
    flexShrink: 1, // Permite que el texto se ajuste y no se desborde
  },
  treesIconContainer: {
    opacity: 0.8,
  },
});
