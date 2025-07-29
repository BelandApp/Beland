import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const productStyles = StyleSheet.create({
  // Product grid
  productGrid: {
    paddingHorizontal: 4,
  },
  productRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 16,
  },
  // Product card
  productCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    marginHorizontal: 4,
  },
  productImage: {
    width: "100%" as const,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    marginBottom: 8,
  },
  productBrand: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  productPriceRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.belandGreen,
  },
  addToCartButton: {
    backgroundColor: colors.belandOrange,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addToCartText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center" as const,
    marginTop: 16,
  },
});
