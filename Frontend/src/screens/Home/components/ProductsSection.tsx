import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useProducts } from "src/hooks/useProducts";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { Product } from "src/types/Products";

type CatalogScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Catalog"
>;


const ProductsSection: React.FC = () => {
    const navigation = useNavigation<CatalogScreenNavigationProp>();
  const { products, loading, error } = useProducts({ limit: 100 }); // Obtener una cantidad grande de productos

  const [randomProducts, setRandomProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      // Barajar el array de productos y tomar los primeros 3
      const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
      const selectedRandom = shuffledProducts.slice(0, 3);
      setRandomProducts(selectedRandom);
    }
  }, [products]);

  const goToCatalog = () => {
    // Redirige a la pantalla de catálogo
    navigation.navigate("Catalog"); // Ajusta el nombre de la ruta si es diferente
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error al cargar productos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Descubre Productos Reciclados Únicos</Text>
      <Text style={styles.subtitle}>
        Dale una segunda vida a los materiales y apoya un futuro sostenible.
      </Text>
      <View style={styles.productsGrid}>
        {randomProducts.map(product => (
          <View key={product.id} style={styles.productCard}>
            {product.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text>No hay imagen</Text>
              </View>
            )}
            <Text style={styles.productName} numberOfLines={2}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>${product.price}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity onPress={goToCatalog} style={styles.catalogButton}>
        <Text style={styles.catalogButtonText}>Ver Catálogo Completo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B35",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  productsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  productCard: {
    width: "30%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    padding: 8,
  },
  productImage: {
    width: "100%",
    height: 100, // Altura fija para las imágenes
    borderRadius: 8,
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4caf50",
    textAlign: "center",
  },
  catalogButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: "center",
  },
  catalogButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    textAlign: "center",
    color: "#888",
  },
  errorText: {
    textAlign: "center",
    color: "red",
  },
});

export default ProductsSection;
