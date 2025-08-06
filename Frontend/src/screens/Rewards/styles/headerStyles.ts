import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const headerStyles = StyleSheet.create({
  header: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: Platform.OS === "android" ? 20 : 50, // Reducido para Android porque la barra de estado está oculta
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000, // Para que esté por encima del contenido scrollable
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold" as const,
  },
  headerSubtitle: {
    color: "#FFFFFF",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  coinsDisplay: {
    // El BeCoinsBalance se encarga de todos los estilos
  },
  coinsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
});
