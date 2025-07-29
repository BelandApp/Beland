import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const searchFilterStyles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  // Filter panel styles
  filterPanel: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  clearFiltersButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  clearFiltersText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: colors.belandOrange + "15",
    borderColor: colors.belandOrange,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  filterChipTextActive: {
    color: colors.belandOrange,
    fontWeight: "600" as const,
  },
  priceRange: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  priceSeparator: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
});
