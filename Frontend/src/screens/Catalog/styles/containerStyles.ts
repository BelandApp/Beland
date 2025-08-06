import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  contentContainer: {
    paddingTop: 140,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === "android" ? 96 : 86, // Espacio extra para la nueva barra de navegación
  },
  // Header styles
  headerContainer: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === "android" ? 20 : 50, // Reducido para Android porque la barra de estado está oculta
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: colors.belandOrange, // Fondo naranja por defecto
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerCreatingGroup: {
    backgroundColor: colors.belandGreen,
    shadowColor: colors.belandGreen,
    shadowOpacity: 0.3,
  },
  headerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#FFFFFF", // Color blanco por defecto para el fondo naranja
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF", // Color blanco por defecto para el fondo naranja
    fontWeight: "500" as const,
    opacity: 0.9,
  },
  coinsContainer: {
    // El BeCoinsBalance se encarga de todos los estilos
  },
  coinsText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: colors.belandGreen,
    marginLeft: 6,
  },
  groupActions: {
    flexDirection: "row" as const,
    gap: 12,
    alignItems: "center",
  },
  groupActionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "rgba(244, 67, 54, 0.9)",
    borderColor: "rgba(244, 67, 54, 0.6)",
    shadowColor: "#F44336",
    shadowOpacity: 0.2,
  },
  groupActionIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    textAlign: "center" as const,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  groupActionText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#FFFFFF",
    textAlign: "center" as const,
  },
  cancelButtonText: {
    color: "#FFFFFF",
  },
  locationContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  locationText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
