import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { productStyles } from "../styles";
import { AvailableProduct } from "../../../constants/products";
import { formatUSDPrice } from "../../../constants";

interface ProductCardProps {
  product: AvailableProduct;
  onAddToCart: (product: AvailableProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <View style={productStyles.productCard}>
      <Image
        source={{ uri: product.image }}
        style={productStyles.productImage}
        resizeMode="cover"
      />
      <Text style={productStyles.productBrand}>Productos Beland</Text>
      <Text style={productStyles.productName}>{product.name}</Text>
      <Text style={productStyles.productCategory}>{product.category}</Text>
      <View style={productStyles.productPriceRow}>
        <Text style={productStyles.productPrice}>
          ${formatUSDPrice(product.basePrice)}
        </Text>
        <TouchableOpacity
          style={productStyles.addToCartButton}
          onPress={() => onAddToCart(product)}
        >
          <Text style={productStyles.addToCartText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
