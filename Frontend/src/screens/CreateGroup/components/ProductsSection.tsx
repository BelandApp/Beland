import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { Product, Participant } from "../../../types";
import { FormErrors } from "../../../business/validation/groupValidation";
import {
  getTotalEstimatedCost,
  getCostPerPerson,
  formatCurrency,
  formatBeCoins,
} from "../../../business/costCalculations";
import { productStyles } from "../styles";
import { formatUSDPrice, CURRENCY_CONFIG } from "../../../constants";

interface ProductsSectionProps {
  products: Product[];
  participants: Participant[];
  errors: FormErrors;
  location?: string;
  onUpdateProductQuantity: (id: string, quantity: number) => void;
  onRemoveProduct: (id: string) => void;
  onNavigateToCatalog: () => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  participants,
  errors,
  location,
  onUpdateProductQuantity,
  onRemoveProduct,
  onNavigateToCatalog,
}) => {
  return (
    <>
      {/* Enlace al catálogo */}
      <Card style={productStyles.modernCard}>
        <View style={productStyles.cardHeader}>
          <View style={productStyles.iconContainer}>
            <Text style={productStyles.cardIcon}>🛍️</Text>
          </View>
          <View style={productStyles.cardHeaderText}>
            <Text style={productStyles.cardTitle}>Agregar Productos</Text>
            <Text style={productStyles.cardSubtitle}>
              Explora nuestro catálogo completo de productos circulares
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={productStyles.modernCatalogButton}
          onPress={onNavigateToCatalog}
          activeOpacity={0.8}
        >
          <View style={productStyles.catalogButtonContent}>
            <Text style={productStyles.catalogButtonIcon}>🛒</Text>
            <View style={productStyles.catalogButtonTextContainer}>
              <Text style={productStyles.modernCatalogButtonText}>
                Ir al Catálogo
              </Text>
              <Text style={productStyles.catalogButtonSubtext}>
                Descubre productos únicos
              </Text>
            </View>
            <Text style={productStyles.catalogButtonArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {products.length === 0 && (
          <View style={productStyles.modernCatalogHint}>
            <Text style={productStyles.catalogHintIcon}>💡</Text>
            <Text style={productStyles.modernCatalogHintText}>
              Presiona el botón "+" de cualquier producto y selecciona "Crear
              juntada circular"
            </Text>
          </View>
        )}

        {errors.products && (
          <Text style={productStyles.modernErrorText}>{errors.products}</Text>
        )}
      </Card>

      {/* Productos */}
      <Card style={productStyles.modernCard}>
        <View style={productStyles.cardHeader}>
          <View style={productStyles.iconContainer}>
            <Text style={productStyles.cardIcon}>🛒</Text>
          </View>
          <View style={productStyles.cardHeaderText}>
            <Text style={productStyles.cardTitle}>Productos Seleccionados</Text>
            <Text style={productStyles.cardSubtitle}>
              {products.length > 0
                ? `${products.length} producto${
                    products.length !== 1 ? "s" : ""
                  } agregado${products.length !== 1 ? "s" : ""}`
                : "Agrega productos desde el catálogo"}
            </Text>
          </View>
        </View>

        {products.length > 0 ? (
          <View style={productStyles.selectedProducts}>
            {products.map((product, idx) => (
              <View key={product.id} style={productStyles.selectedProductItem}>
                <View style={productStyles.productMainInfo}>
                  <View style={productStyles.productImageContainer}>
                    {product.image ? (
                      <Image
                        source={{ uri: product.image }}
                        style={productStyles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={productStyles.productEmoji}>📦</Text>
                    )}
                  </View>
                  <View style={productStyles.productDetails}>
                    <Text style={productStyles.productName}>
                      {product.name}
                    </Text>
                    <Text style={productStyles.productCategory}>
                      {product.category}
                    </Text>
                    <Text style={productStyles.productPricePerUnit}>
                      {formatUSDPrice(product.estimatedPrice)} por unidad
                    </Text>
                  </View>
                </View>

                <View style={productStyles.productControls}>
                  {/* Solo mostrar controles de cantidad para el primer producto si la ubicación incluye 'domicilio' */}
                  {(idx !== 0 ||
                    (idx === 0 &&
                      typeof location === "string" &&
                      location &&
                      location.toLowerCase().includes("domicilio"))) && (
                    <View style={productStyles.quantityControls}>
                      <TouchableOpacity
                        style={[
                          productStyles.quantityButton,
                          product.quantity <= 1 &&
                            productStyles.quantityButtonDisabled,
                        ]}
                        onPress={() =>
                          onUpdateProductQuantity(
                            product.id,
                            product.quantity - 1
                          )
                        }
                        activeOpacity={0.8}
                        disabled={product.quantity <= 1}
                      >
                        <Text
                          style={[
                            productStyles.quantityButtonText,
                            product.quantity <= 1 &&
                              productStyles.quantityButtonTextDisabled,
                          ]}
                        >
                          −
                        </Text>
                      </TouchableOpacity>
                      <View style={productStyles.quantityDisplayContainer}>
                        <Text style={productStyles.quantityText}>
                          {product.quantity}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={productStyles.quantityButton}
                        onPress={() =>
                          onUpdateProductQuantity(
                            product.id,
                            product.quantity + 1
                          )
                        }
                        activeOpacity={0.8}
                      >
                        <Text style={productStyles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  <View style={productStyles.productPriceAndRemove}>
                    <Text style={productStyles.productTotalPrice}>
                      {formatUSDPrice(
                        product.estimatedPrice * product.quantity
                      )}
                    </Text>
                    <TouchableOpacity
                      style={productStyles.removeProductButton}
                      onPress={() => onRemoveProduct(product.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={productStyles.removeProductButtonText}>
                        ×
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Resumen de costos */}
            <View style={productStyles.costSummary}>
              <View style={productStyles.costRow}>
                <Text style={productStyles.costLabel}>Total estimado:</Text>
                <Text style={productStyles.costValue}>
                  {formatCurrency(getTotalEstimatedCost(products))}
                </Text>
              </View>
              <View style={productStyles.costRow}>
                <Text style={productStyles.costLabel}>Por persona:</Text>
                <View style={productStyles.costWithIcon}>
                  <BeCoinIcon width={16} height={16} />
                  <Text style={productStyles.costValue}>
                    {formatBeCoins(getCostPerPerson(products, participants))}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <Text style={productStyles.noProductsText}>
            No has seleccionado productos aún
          </Text>
        )}
      </Card>
    </>
  );
};
