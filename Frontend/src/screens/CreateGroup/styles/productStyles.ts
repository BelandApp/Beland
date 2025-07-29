import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const productStyles = StyleSheet.create({
  // Card styles
  modernCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.belandOrange + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  modernErrorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 8,
    marginLeft: 52,
  },

  // Productos seleccionados
  selectedProducts: {
    gap: 16,
  },
  selectedProductItem: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  productMainInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  productImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.belandOrange + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  productEmoji: {
    fontSize: 24,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  productPricePerUnit: {
    fontSize: 12,
    color: colors.belandOrange,
    fontWeight: "500",
  },

  // Controles de producto
  productControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.belandOrange,
    borderRadius: 8,
  },
  quantityButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  quantityButtonTextDisabled: {
    color: "#9CA3AF",
  },
  quantityDisplayContainer: {
    minWidth: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  productPriceAndRemove: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  productTotalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  removeProductButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  removeProductButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Resumen de costos
  costSummary: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  costWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  // Estado sin productos
  noProductsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    paddingVertical: 20,
  },

  // Botón de catálogo
  modernCatalogButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.belandOrange + "30",
    borderStyle: "dashed",
    marginBottom: 16,
  },
  catalogButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  catalogButtonIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  catalogButtonTextContainer: {
    flex: 1,
  },
  modernCatalogButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.belandOrange,
    marginBottom: 4,
  },
  catalogButtonSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  catalogButtonArrow: {
    fontSize: 18,
    color: colors.belandOrange,
    fontWeight: "600",
  },

  // Hint de catálogo
  modernCatalogHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.belandOrange + "10",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.belandOrange + "20",
  },
  catalogHintIcon: {
    fontSize: 16,
    marginRight: 12,
    marginTop: 2,
  },
  modernCatalogHintText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
});
