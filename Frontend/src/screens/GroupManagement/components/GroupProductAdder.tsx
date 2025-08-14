import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { AVAILABLE_PRODUCTS, AvailableProduct } from "../../../data/products";
import { useGroupAdminStore } from "../../../stores/groupStores";

interface GroupProductAdderProps {
  groupId: string;
}

export const GroupProductAdder: React.FC<GroupProductAdderProps> = ({
  groupId,
}) => {
  const { addProductToGroup, productsByGroup } = useGroupAdminStore();
  const groupProducts = productsByGroup[groupId] || [];
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const flatListRef = useRef(null);
  // Obtener categorías únicas ordenadas
  const categories = Array.from(
    new Set(AVAILABLE_PRODUCTS.map((p) => p.category))
  );
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || "");

  const handleAddProduct = (product: AvailableProduct) => {
    addProductToGroup(groupId, {
      id: product.id,
      name: product.name,
      quantity: 1,
      estimatedPrice: product.basePrice,
      totalPrice: product.basePrice,
      category: product.category,
      basePrice: product.basePrice,
      image: product.image,
    });
  };

  const renderProduct = ({ item }: { item: AvailableProduct }) => {
    const alreadyInGroup = groupProducts.some((p) => p.id === item.id);
    return (
      <View style={styles.productContainer} key={item.id}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.basePrice}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, alreadyInGroup && styles.addedButton]}
          onPress={() => handleAddProduct(item)}
          disabled={alreadyInGroup}
        >
          <Text style={styles.addButtonText}>
            {alreadyInGroup ? "Agregado" : "Agregar"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Filtrado de productos por búsqueda
  // Filtrado por búsqueda y categoría
  const filteredProducts = AVAILABLE_PRODUCTS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory ? item.category === selectedCategory : true)
  );

  // Agrupar productos por categoría para FlatList con headers
  const groupedProducts = categories
    .map((cat) => ({
      title: cat,
      data: AVAILABLE_PRODUCTS.filter(
        (item) =>
          item.category === cat &&
          item.name.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.data.length > 0);

  return (
    <View style={{ marginVertical: 8, alignItems: "center" }}>
      <TouchableOpacity
        style={styles.openButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.openButtonText}>Agregar productos al grupo</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalPanel}>
            <TouchableOpacity
              style={styles.closeIconBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeIconText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Selecciona productos para agregar</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar producto..."
              placeholderTextColor="#aaa"
              value={search}
              onChangeText={setSearch}
              autoFocus={false}
            />
            {/* Menú horizontal de categorías */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryMenu}
              contentContainerStyle={{ paddingBottom: 6 }}
            >
              {categories.map((cat) => (
                <TouchableWithoutFeedback
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <View
                    style={[
                      styles.categoryBtn,
                      selectedCategory === cat && styles.categoryBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBtnText,
                        selectedCategory === cat &&
                          styles.categoryBtnTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              ))}
            </ScrollView>
            {/* FlatList agrupada por categoría */}
            <FlatList
              ref={flatListRef}
              data={groupedProducts}
              keyExtractor={(item) => item.title}
              style={styles.productsScroll}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: group }) => (
                <View>
                  <Text style={styles.categoryHeader}>{group.title}</Text>
                  {group.data.map((prod) => renderProduct({ item: prod }))}
                </View>
              )}
              ListEmptyComponent={
                <Text
                  style={{ color: "#888", textAlign: "center", marginTop: 32 }}
                >
                  No se encontraron productos
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 0,
  },
  openButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  openButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalPanel: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 20,
    width: "92%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
    position: "relative",
  },
  closeIconBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  closeIconText: {
    fontSize: 22,
    color: "#888",
    fontWeight: "bold",
    marginTop: -2,
  },
  title: {
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 18,
    color: "#222",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  productsScroll: {
    maxHeight: 420,
    width: "100%",
    paddingVertical: 2,
  },
  searchInput: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: "#222",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    backgroundColor: "#F8F9FA",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    elevation: 1,
    width: "100%",
  },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: "#eee",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 15,
    color: "#FF6B35",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addedButton: {
    backgroundColor: "#bbb",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  categoryMenu: {
    width: "100%",
    marginBottom: 10,
    marginTop: 2,
    paddingLeft: 2,
  },
  categoryBtn: {
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryBtnActive: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  categoryBtnText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 15,
  },
  categoryBtnTextActive: {
    color: "#fff",
  },
  categoryHeader: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF6B35",
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 2,
    letterSpacing: 0.2,
  },
});
