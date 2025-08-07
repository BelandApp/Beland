import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const actionsStyles = StyleSheet.create({
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#8bced6b0",
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
    flex: 1,
    maxWidth: 80,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: "600",
    textAlign: "center",
  },
});
