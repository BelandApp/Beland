import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const productStyles = StyleSheet.create({
  // Product grid
  productGrid: {
    paddingHorizontal: 4,
    width: "100%",
    boxSizing: "border-box",
  },
  productRow: {
    flexDirection: "row" as const,
    justifyContent: "flex-start" as const,
    marginBottom: 16,
    flexWrap: "wrap",
    ...(Platform.OS === "web"
      ? {
          gap: 16,
          justifyContent: "center",
          width: "100%",
        }
      : {}),
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
    ...(Platform.OS === "web"
      ? {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 140,
          maxWidth: 220,
          width: "100%",
          boxSizing: "border-box",
        }
      : {
          flex: 1,
          marginHorizontal: 4,
        }),
  },
  productImageContainer: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    ...(Platform.OS === "web"
      ? {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: 200,
          maxHeight: 200,
        }
      : {}),
  },
  productImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    ...(Platform.OS === "web"
      ? {
          maxWidth: 320,
          maxHeight: 200,
        }
      : {}),
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
    ...(Platform.OS === "web"
      ? {
          marginLeft: 8,
        }
      : {}),
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
