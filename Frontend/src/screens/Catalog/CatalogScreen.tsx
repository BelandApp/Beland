import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCreateGroupStore } from "../../stores/useCreateGroupStore";
import { ConfirmationAlert } from "../../components/ui/ConfirmationAlert";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import * as Haptics from "expo-haptics";

// Hooks
import { useCatalogFilters, useCatalogModals } from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { categoryService } from "../../services/categoryService";
import { ProductCardType } from "./components/ProductCard";

// Components
import {
  SearchBar,
  FilterPanel,
  ProductGrid,
  DeliveryModal,
  ProductAddedModal,
} from "./components";

// Styles
import { containerStyles } from "./styles";

// Types
import { Group } from "../../types";

import { useCartStore } from "../../stores/useCartStore";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { GroupSelectModal } from "./components/GroupSelectModal";
import { useGroupAdminStore } from "../../stores/groupStores";
import { GroupService } from "../../services/groupService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const route =
    (navigation as any)
      .getState?.()
      ?.routes?.find?.((r: any) => r.name === "Catalog") || {};
  const groupId = route?.params?.groupId;

  const {
    addProduct: addProductToCart,
    products: cartProducts,
    clearCart,
  } = useCartStore();

  const { addProductToGroup } = useGroupAdminStore();
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const { setIsCreatingGroup, isCreatingGroup } = useCreateGroupStore();

  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  } = useCatalogFilters();

  const {
    showDeliveryModal,
    showProductAddedModal,
    selectedProduct,
    openDeliveryModal,
    closeDeliveryModal,
    openProductAddedModal,
    closeProductAddedModal,
  } = useCatalogModals();

  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [allCategories, setAllCategories] = useState<
    { id: string; name: string }[]
  >([]);

  const selectedCategoryId = allCategories.find(
    cat => cat.name === filters.categories[0]
  )?.id;

  const brands: string[] = [];

  const { products, loading, error, updateQuery } = useProducts({
    page: 1,
    category_id: undefined,
    name: searchText,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  useEffect(() => {
    const query = {
      page: 1,
      limit: 12,
      name: searchText,
      category_id: selectedCategoryId || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };

    updateQuery(query);
  }, [filters, searchText, selectedCategoryId]);

  useEffect(() => {
    (async () => {
      try {
        const categories = await categoryService.getCategories();
        setAllCategories(
          categories.map(cat => ({ id: cat.id, name: cat.name }))
        );
      } catch (e: any) {
        console.error("[CATEGORIAS] Error al cargar categorías:", e);
        const cats = Array.from(
          new Set((products || []).map(p => p.category).filter(Boolean))
        ).map(name => ({ id: String(name), name: String(name) }));
        setAllCategories(cats);
      }
    })();
  }, [products]);

  const handleAddProduct = (product: ProductCardType) => {
    if ("image_url" in product) {
      addProductToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        quantity: 1,
        image: product.image_url,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleContinueAddingProducts = () => {
    closeProductAddedModal();
  };

  const handleContinueCreatingGroup = () => {
    closeProductAddedModal();
    (navigation as any).navigate("Groups", {
      screen: "CreateGroup",
    });
  };

  const handleCreateCircularGroup = () => {
    closeDeliveryModal();
    const activeGroups = GroupService.getActiveGroups();
    setGroups(activeGroups);
    setShowGroupSelect(true);
  };

  const handleSelectGroup = (group: Group) => {
    if (cartProducts && cartProducts.length > 0) {
      cartProducts.forEach(prod => {
        addProductToGroup(group.id, {
          id: prod.id,
          name: prod.name,
          quantity: prod.quantity,
          estimatedPrice: prod.price,
          totalPrice: prod.price * prod.quantity,
          category: "",
          basePrice: prod.price,
          image: prod.image || "",
        });
      });
      clearCart();
    }
    setShowGroupSelect(false);
    (navigation as any).navigate("Groups", {
      screen: "GroupManagement",
      params: { groupId: group.id },
    });
  };

  const handleHomeDelivery = () => {
    closeDeliveryModal();
    setShowDeliveryInfo(true);
  };

  const handleShowRoute = () => {
    setShowDeliveryInfo(false);
    setShowRouteInfo(true);
  };

  const handleBackToGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate("Groups", {
      screen: "CreateGroup",
    });
  };

  const handleCancelGroup = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelConfirmation(true);
  };

  const confirmCancelGroup = () => {
    setIsCreatingGroup(false);
    useCreateGroupStore.getState().clearGroup();
    setShowCancelConfirmation(false);
    (navigation as any).goBack();
  };

  return (
    <SafeAreaView style={containerStyles.container}>
      {/* Header */}
      <View
        style={[
          containerStyles.headerContainer,
          isCreatingGroup && containerStyles.headerCreatingGroup,
        ]}>
        <View style={containerStyles.headerRow}>
          <View style={containerStyles.headerLeft}>
            <View style={containerStyles.headerTitles}>
              <Text style={containerStyles.headerTitle}>
                {isCreatingGroup ? "Agregando al grupo" : "Catálogo"}
              </Text>
              <Text style={containerStyles.headerSubtitle}>
                {isCreatingGroup
                  ? `${products.length} producto${
                      products.length !== 1 ? "s" : ""
                    } agregado${products.length !== 1 ? "s" : ""}`
                  : "Productos circulares disponibles"}
              </Text>
            </View>
          </View>
          {!isCreatingGroup ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <BeCoinsBalance
                size="medium"
                variant="header"
                style={containerStyles.coinsContainer}
              />
              <TouchableOpacity
                style={styles.headerCartBtn}
                onPress={() => setShowCart(true)}
                activeOpacity={0.8}>
                <MaterialCommunityIcons
                  name="cart-variant"
                  size={32}
                  color="#FF6B35"
                  style={styles.headerCartIcon}
                />
                {cartProducts.length > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>
                      {cartProducts.length}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={containerStyles.groupActions}>
              <TouchableOpacity
                style={containerStyles.groupActionButton}
                onPress={handleBackToGroup}>
                <Text style={containerStyles.groupActionIcon}>👥</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  containerStyles.groupActionButton,
                  containerStyles.cancelButton,
                ]}
                onPress={handleCancelGroup}>
                <Text style={containerStyles.groupActionIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={containerStyles.container}
        contentContainerStyle={containerStyles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <SearchBar searchQuery={searchText} onSearchChange={setSearchText} />

        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={allCategories.map(cat => cat.name)}
            brands={brands}
          />
        )}

        <TouchableOpacity
          style={{ marginBottom: 16, alignSelf: "flex-end" }}
          onPress={() => setShowFilters(!showFilters)}>
          <Text style={{ color: "#FF6B35", fontWeight: "600" }}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 32 }}>
            Cargando productos...
          </Text>
        ) : error ? (
          <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
            {error}
          </Text>
        ) : (
          <ProductGrid products={products} onAddToCart={handleAddProduct} />
        )}
      </ScrollView>

      <CartBottomSheet
        visible={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          if (cartProducts.length > 0) {
            const cartProd = cartProducts[0];
            const fullProduct = products.find(p => p.id === cartProd.id);
            if (fullProduct) {
              openDeliveryModal(fullProduct);
            } else {
              Alert.alert(
                "Producto no disponible",
                "El producto seleccionado ya no está disponible en el catálogo. Por favor, actualiza la lista de productos.",
                [{ text: "OK" }]
              );
            }
          }
        }}
      />

      <DeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onSelectPickup={handleCreateCircularGroup}
        onSelectDelivery={handleHomeDelivery}
      />

      <ProductAddedModal
        visible={showProductAddedModal}
        onContinueAdding={handleContinueAddingProducts}
        onContinueGroup={handleContinueCreatingGroup}
      />

      <ConfirmationAlert
        visible={showCancelConfirmation}
        title="¿Cancelar creación del grupo?"
        message="Se perderán todos los productos agregados al carrito. Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="Continuar comprando"
        type="danger"
        icon="🛒"
        onConfirm={confirmCancelGroup}
        onCancel={() => setShowCancelConfirmation(false)}
      />

      <ConfirmationAlert
        visible={showDeliveryInfo}
        title="Entrega a domicilio"
        message={`El producto "${selectedProduct?.name}" será entregado en tu domicilio.\n\nRuta: Desde el local hasta tu casa.\nTiempo estimado: 30-45 minutos.`}
        confirmText="Ver ruta"
        cancelText="Entendido"
        type="info"
        icon="🚚"
        onConfirm={handleShowRoute}
        onCancel={() => setShowDeliveryInfo(false)}
      />

      <ConfirmationAlert
        visible={showRouteInfo}
        title="Funcionalidad en desarrollo"
        message="Aquí se mostraría el mapa interactivo con la ruta de entrega en tiempo real."
        confirmText="Entendido"
        cancelText="Volver"
        type="info"
        icon="🗺️"
        onConfirm={() => setShowRouteInfo(false)}
        onCancel={() => setShowRouteInfo(false)}
      />

      <GroupSelectModal
        visible={showGroupSelect}
        groups={groups}
        onSelect={handleSelectGroup}
        onClose={() => setShowGroupSelect(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerCartBtn: {
    marginLeft: 12,
    padding: 6,
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 2,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  headerCartIcon: {},
  headerBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  headerBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  checkoutOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  checkoutModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    alignItems: "center",
    elevation: 8,
  },
  checkoutTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#222",
  },
  checkoutOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3ED",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    width: "100%",
  },
  checkoutOptionText: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "600",
  },
  checkoutCancel: {
    marginTop: 8,
    padding: 8,
  },
  checkoutCancelText: {
    color: "#888",
    fontSize: 15,
  },
});
