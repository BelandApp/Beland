import { colors } from "../../../styles/colors";

export const containerStyles = {
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Content
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20, // Margin superior para separar del navbar
    paddingBottom: 120, // Espacio extra para la navegación sticky-immersive
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
};
