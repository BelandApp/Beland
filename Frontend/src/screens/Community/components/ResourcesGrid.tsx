import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Resource } from "../../../types/resource";
import { gridStyles } from "../styles";
import { colors } from "../../../styles/colors";

interface ResourcesGridProps {
  resources: Resource[];
  onPurchase: (resource: Resource) => void;
  loading?: boolean;
}

interface ResourceCardProps {
  resource: Resource;
  onPurchase: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  onPurchase,
}) => {
  const isOutOfStock = resource.resource_quanity <= 0;
  const hasDiscount = resource.resource_discount > 0;
  const finalPrice = hasDiscount
    ? resource.resource_price * (1 - resource.resource_discount / 100)
    : resource.resource_price;

  return (
    <View style={gridStyles.resourceCard}>
      <View style={gridStyles.resourceImage}>
        {resource.resource_img ? (
          <Image
            source={{ uri: resource.resource_img }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.belandGreenLight,
            }}
          >
            <Text style={{ color: colors.background, fontSize: 12 }}>
              Sin imagen
            </Text>
          </View>
        )}
      </View>

      <View style={gridStyles.resourceContent}>
        <Text style={gridStyles.resourceName} numberOfLines={2}>
          {resource.resource_name}
        </Text>

        <Text style={gridStyles.resourceDescription} numberOfLines={3}>
          {resource.resource_desc}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          {hasDiscount && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                textDecorationLine: "line-through",
                marginRight: 8,
              }}
            >
              ${resource.resource_price.toFixed(2)}
            </Text>
          )}
          <Text style={gridStyles.resourcePrice}>${finalPrice.toFixed(2)}</Text>
          {hasDiscount && (
            <Text
              style={{
                fontSize: 10,
                color: colors.success,
                backgroundColor: colors.belandGreenLight,
                paddingHorizontal: 4,
                paddingVertical: 2,
                borderRadius: 4,
                marginLeft: 8,
              }}
            >
              -{resource.resource_discount}%
            </Text>
          )}
        </View>

        <Text style={gridStyles.resourceStock}>
          Stock: {resource.resource_quanity} unidades
        </Text>

        <TouchableOpacity
          style={[
            gridStyles.purchaseButton,
            isOutOfStock && gridStyles.purchaseButtonDisabled,
          ]}
          onPress={() => onPurchase(resource)}
          disabled={isOutOfStock}
        >
          <Text style={gridStyles.purchaseButtonText}>
            {isOutOfStock ? "Agotado" : "Comprar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export const ResourcesGrid: React.FC<ResourcesGridProps> = ({
  resources,
  onPurchase,
  loading = false,
}) => {
  if (resources.length === 0 && !loading) {
    return (
      <View
        style={{
          padding: 40,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          No se encontraron recursos en esta categoría
        </Text>
      </View>
    );
  }

  return (
    <View style={gridStyles.container}>
      <View style={gridStyles.grid}>
        {resources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onPurchase={onPurchase}
          />
        ))}
      </View>
    </View>
  );
};
