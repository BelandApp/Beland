import { StyleSheet } from "react-native";
import { colors } from "@styles/colors";

export const styles = StyleSheet.create({
  pointCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  pointInfo: {
    flex: 1,
  },
  pointName: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  pointAddress: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  pointDistance: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
  },
  pointStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  wasteTypesSection: {
    marginBottom: 16,
  },
  wasteTypesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  wasteTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  wasteTypeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  wasteTypeEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  wasteTypeName: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  moreTypesChip: {
    backgroundColor: colors.textSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  moreTypesText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  directionsButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  directionsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  selectedPointCard: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: "#F0F9FF",
    elevation: 6,
    shadowOpacity: 0.2,
  },
  selectedBadge: {
    position: "absolute",
    top: -8,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  selectedPointName: {
    color: colors.primary,
    fontWeight: "700",
  },
});
