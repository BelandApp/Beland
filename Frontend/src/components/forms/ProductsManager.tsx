import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BeCoinIcon } from "../icons/BeCoinIcon";
import { Product } from "../../types";
import { commonStyles } from "../../styles";
import { formatCurrency } from "../../utils/validation";

interface ProductsManagerProps {
  products: Product[];
  availableProducts: any[];
  errors: any;
  onAddProduct: (product: any) => void;
  onRemoveProduct: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  getTotalCost: () => number;
  getCostPerPerson: () => number;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  availableProducts,
  errors,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  getTotalCost,
  getCostPerPerson,
}) => {
  return (
    <>
      <Text style={commonStyles.cardTitle}>Productos Seleccionados</Text>

      {/* Productos seleccionados */}
      {products.length > 0 ? (
        <View style={productStyles.selectedProducts}>
          {products.map((product) => (
            <View key={product.id} style={productStyles.selectedProductItem}>
              <View style={productStyles.productInfo}>
                <Text style={productStyles.productName}>{product.name}</Text>
                <Text style={productStyles.productPrice}>
                  {formatCurrency(product.estimatedPrice * product.quantity)}
                </Text>
              </View>
              <View style={productStyles.quantityControls}>
                <TouchableOpacity
                  style={productStyles.quantityButton}
                  onPress={() =>
                    onUpdateQuantity(product.id, product.quantity - 1)
                  }
                >
                  <Text style={productStyles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={productStyles.quantityText}>
                  {product.quantity}
                </Text>
                <TouchableOpacity
                  style={productStyles.quantityButton}
                  onPress={() =>
                    onUpdateQuantity(product.id, product.quantity + 1)
                  }
                >
                  <Text style={productStyles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Resumen de costos */}
          <View style={productStyles.costSummary}>
            <View style={productStyles.costRow}>
              <Text style={productStyles.costLabel}>Total estimado:</Text>
              <View style={productStyles.costWithIcon}>
                <BeCoinIcon width={16} height={16} />
                <Text style={productStyles.costValue}>
                  {formatCurrency(getTotalCost())}
                </Text>
              </View>
            </View>
            <View style={productStyles.costRow}>
              <Text style={productStyles.costLabel}>Por persona:</Text>
              <View style={productStyles.costWithIcon}>
                <BeCoinIcon width={14} height={14} />
                <Text style={productStyles.costValue}>
                  {formatCurrency(Math.round(getCostPerPerson()))}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <Text style={productStyles.noProductsText}>
          No hay productos seleccionados
        </Text>
      )}

      {errors.products && (
        <Text style={commonStyles.errorText}>{errors.products}</Text>
      )}

      {/* Catálogo de productos disponibles */}
      <Text style={[commonStyles.cardTitle, { marginTop: 24 }]}>
        Catálogo de Productos
      </Text>
      <View style={productStyles.productsGrid}>
        {availableProducts.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={productStyles.productCard}
            onPress={() => onAddProduct(product)}
          >
            <View style={productStyles.productCardContent}>
              <Text style={productStyles.productCardName}>{product.name}</Text>
              <Text style={productStyles.productCardCategory}>
                {product.category}
              </Text>
              <Text style={productStyles.productCardPrice}>
                {formatCurrency(product.basePrice)}
              </Text>
            </View>
            <Text style={productStyles.addButtonText}>+</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

const productStyles = {
  selectedProducts: {
    gap: 12,
  },
  selectedProductItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333333",
  },
  productPrice: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600" as const,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FF8C42",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333333",
    minWidth: 24,
    textAlign: "center" as const,
  },
  costSummary: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  costRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 16,
    color: "#666666",
  },
  costValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#333333",
  },
  costWithIcon: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  noProductsText: {
    textAlign: "center" as const,
    color: "#666666",
    fontStyle: "italic" as const,
    paddingVertical: 20,
  },
  productsGrid: {
    gap: 12,
  },
  productCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  productCardContent: {
    flex: 1,
  },
  productCardName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333333",
  },
  productCardCategory: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  productCardPrice: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#4CAF50",
    marginTop: 4,
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: "#FF8C42",
  },
};
