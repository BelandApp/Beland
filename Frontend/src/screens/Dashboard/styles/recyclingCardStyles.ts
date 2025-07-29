import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const recyclingCardStyles = StyleSheet.create({
  recyclingCard: {
    padding: 20,
  },
  recyclingContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recyclingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
  },
  recyclingNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.belandGreen,
  },
  recyclingLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  treesIconContainer: {
    opacity: 0.8,
  },
});
