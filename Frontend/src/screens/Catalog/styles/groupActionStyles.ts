import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const groupActionStyles = StyleSheet.create({
  groupActionButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 16,
    gap: 12,
  },
  backToGroupButton: {
    backgroundColor: colors.belandOrange + "15",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: colors.belandOrange + "30",
    flex: 1,
  },
  backToGroupButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.belandOrange,
    textAlign: "center" as const,
  },
  cancelGroupButton: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#FECACA",
  },
  cancelGroupButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#DC2626",
  },
});
