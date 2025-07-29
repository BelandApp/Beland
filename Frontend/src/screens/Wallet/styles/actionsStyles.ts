import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const actionsStyles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#8bced6b0",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "500",
    textAlign: "center",
  },
});
