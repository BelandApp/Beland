import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const categoryStyles = StyleSheet.create({
  categoriesSection: {
    paddingVertical: 16,
    paddingTop: 24, // Más espacio después del header fijo
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  categoryButtonActive: {
    backgroundColor: colors.belandOrange,
    borderColor: colors.belandOrange,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
});
