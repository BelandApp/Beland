import React from "react";
import { View, Text } from "react-native";
import { productStyles } from "../styles";
import { AvailableProduct } from "../../../constants/products";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: AvailableProduct[];
  onAddToCart: (product: AvailableProduct) => void;
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

  // Organizar productos en filas de 2 columnas
  const rows = [];
  for (let i = 0; i < products.length; i += 2) {
    rows.push(products.slice(i, i + 2));
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
