import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const activityStyles = StyleSheet.create({
  activitySection: {
    gap: 12,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  activityCard: {
    padding: 16,
  },
  activityContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.belandGreenLight + "40",
    justifyContent: "center",
    alignItems: "center",
  },
  activityIconSpend: {
    backgroundColor: "#FFEBEE",
  },
  activityAction: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  activityLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityRight: {
    alignItems: "flex-end",
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityCoins: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.belandGreen,
  },
  activityCoinsSpend: {
    color: "#F44336",
  },
  activityDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
