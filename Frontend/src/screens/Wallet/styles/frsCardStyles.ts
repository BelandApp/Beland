import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const frsCardStyles = StyleSheet.create({
  frsCard: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  frsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  frsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.belandOrange,
    justifyContent: "center",
    alignItems: "center",
  },
  frsIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  frsInfo: {
    flex: 1,
  },
  frsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  frsSubtitle: {
    fontSize: 12,
    color: "#FFB300",
  },
  frsAmounts: {
    alignItems: "flex-end",
    gap: 2,
  },
  frsAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  frsRate: {
    fontSize: 14,
    color: colors.belandGreen,
    fontWeight: "500",
  },
  frsDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  frsNotification: {
    padding: 4,
  },
  notificationIcon: {
    fontSize: 16,
  },
});
