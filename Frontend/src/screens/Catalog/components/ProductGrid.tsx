import React from "react";
import { View, Text } from "react-native";
import { productStyles } from "../styles";
import { CartProduct } from "../../../stores/useCartStore";
import { ProductCard, ProductCardType } from "./ProductCard";

export interface ProductGridProps {
  products: ProductCardType[];
  onAddToCart: (product: ProductCardType) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
}) => {
  if (products.length === 0) {
    return (
      <View style={productStyles.emptyState}>
        <Text style={productStyles.emptyStateText}>
          No se encontraron productos con los filtros aplicados
        </Text>
      </View>
    );
  }

  // Organizar productos en filas: 3 columnas en web, 2 en mobile/tablet
  const isWeb =
    typeof window !== "undefined" &&
    (window as any).navigator?.userAgent?.includes("Mozilla");
  const columns = isWeb ? 3 : 2;
  const rows = [];
  for (let i = 0; i < products.length; i += columns) {
    rows.push(products.slice(i, i + columns));
  }

  return (
    <View style={productStyles.productGrid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={productStyles.productRow}>
          {row.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </View>
      ))}
    </View>
  );
};
