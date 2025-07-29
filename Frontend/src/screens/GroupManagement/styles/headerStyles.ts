import { colors } from "../../../styles/colors";

export const headerStyles = {
  // Header styles with gradient
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // Back button
  backButton: {
    alignSelf: "flex-start" as const,
    marginBottom: 20,
  },
  backButtonContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonIcon: {
    fontSize: 18,
    color: "white",
    marginRight: 8,
    fontWeight: "600" as const,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },

  // Group info card
  groupInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupTitleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 15,
  },
  groupName: {
    fontSize: 26,
    fontWeight: "800" as const,
    color: colors.textPrimary,
    flex: 1,
  },
  adminBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#8B7000",
  },
  groupDetailsContainer: {
    gap: 12,
  },
  detailItemFull: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    width: "100%" as const,
    paddingVertical: 2,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  groupLocation: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500" as const,
    flex: 1,
    lineHeight: 20,
  },
  groupDelivery: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  groupDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: "500" as const,
    flex: 1,
    lineHeight: 20,
    fontStyle: "italic" as const,
  },

  // Stats container
  statsContainer: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 0,
    gap: 8, // Reducir espacio entre tarjetas
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    paddingVertical: 16, // Reducir padding vertical
    paddingHorizontal: 12, // Reducir padding horizontal
    alignItems: "center" as const,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 95, // Reducir altura mínima
  },
  statIconContainer: {
    backgroundColor: "rgba(248, 141, 42, 0.1)",
    borderRadius: 12,
    padding: 6, // Reducir padding del icono
    marginBottom: 6, // Reducir margin bottom
  },
  statIcon: {
    fontSize: 18, // Reducir tamaño del icono
  },
  statValue: {
    fontSize: 16, // Reducir tamaño de fuente
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: 2, // Reducir margin bottom
    textAlign: "center" as const,
    numberOfLines: 1,
  },
  statLabel: {
    fontSize: 11, // Reducir tamaño de fuente
    color: colors.textSecondary,
    fontWeight: "500" as const,
    textAlign: "center" as const,
    numberOfLines: 1,
  },
};
