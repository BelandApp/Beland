import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const groupFilterStyles = StyleSheet.create({
  filterContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: 8,
    marginLeft: 4,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.belandOrange,
    borderColor: colors.belandOrange,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#666666",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
});
