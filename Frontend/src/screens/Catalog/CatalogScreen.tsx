import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCreateGroupStore } from "../../stores/useCreateGroupStore";
import { ConfirmationAlert } from "../../components/ui/ConfirmationAlert";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import * as Haptics from "expo-haptics";

// Hooks
import { useCatalogFilters, useCatalogModals } from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { productsService } from "../../services/productsService";
import { Product } from "../../services/productsService";
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

// import { AvailableProduct, AVAILABLE_PRODUCTS } from "../../data/products";
import { Group } from "../../types";

import { useCartStore } from "../../stores/useCartStore";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { GroupSelectModal } from "./components/GroupSelectModal";
import { useGroupAdminStore } from "../../stores/groupStores";
import { GroupService } from "../../services/groupService";
import { StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const route =
    (navigation as any)
      .getState?.()
      ?.routes?.find?.((r: any) => r.name === "Catalog") || {};
  // Si se navega desde la gestión de grupo, se espera groupId en params
  const groupId = route?.params?.groupId;
  const {
    addProduct: addProductToCart,
    products: cartProducts,
    clearCart,
  } = useCartStore();
  const { addProductToGroup } = useGroupAdminStore();
  // Modal de selección de grupo
  const [showGroupSelect, setShowGroupSelect] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const { setIsCreatingGroup, isCreatingGroup } = useCreateGroupStore();

  // Hooks para manejo de estado
  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    resetFilters,
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

  // Estado para el alert de confirmación
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  // Estado para el carrito
  const [showCart, setShowCart] = useState(false);
  const [showCheckoutOptions, setShowCheckoutOptions] = useState(false);
  // Eliminado: const { products } = useCartStore();

  // Hook para productos desde el backend
  const {
    products,
    total,
    page,
    limit,
    loading,
    error,
    setQuery,
    fetchProducts,
  } = useProducts({
    page: 1,
    limit: 12,
    name: searchText,
    category: filters.categories[0]?.toLowerCase() || undefined,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  // Efecto para actualizar productos al cambiar filtros
  useEffect(() => {
    const query = {
      page: 1,
      limit: 12,
      name: searchText,
      category: filters.categories[0]?.toLowerCase() || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };
    setQuery(query);
  }, [filters, searchText, setQuery]);

  // Obtener todas las categorías posibles al inicio (sin filtro)
  const [allCategories, setAllCategories] = useState<string[]>([]);
  useEffect(() => {
    // Solo obtener una vez al montar
    (async () => {
      try {
        const data = await productsService.getProducts({ limit: 100 });
        console.log("[CATEGORIAS] Respuesta productos:", data);
        const cats = Array.from(
          new Set(
            (data.products || []).map((p: any) => p.category).filter(Boolean)
          )
        );
        console.log("[CATEGORIAS] Categorías encontradas:", cats);
        setAllCategories(cats as string[]);
      } catch (e: any) {
        console.error(
          "[CATEGORIAS] Error al cargar productos:",
          e,
          e?.body || e?.message
        );
        setAllCategories([]);
      }
    })();
  }, []);
  const brands: string[] = [];

  // Función para agregar producto
  const handleAddProduct = (product: ProductCardType) => {
    // Solo permite agregar productos del backend (Product), no del carrito
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

  // Funciones para modales
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
    // Mostrar modal de selección de grupo existente
    const activeGroups = GroupService.getActiveGroups();
    setGroups(activeGroups);
    setShowGroupSelect(true);
  };

  // Al seleccionar un grupo, mover productos del carrito a ese grupo
  const handleSelectGroup = (group: Group) => {
    if (cartProducts && cartProducts.length > 0) {
      cartProducts.forEach((prod) => {
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
    // Navegar a la administración del grupo dentro del stack correcto
    (navigation as any).navigate("Groups", {
      screen: "GroupManagement",
      params: { groupId: group.id },
    });
  };

  const handleHomeDelivery = () => {
    closeDeliveryModal();
    // Mostrar información de entrega con nuestro alert personalizado
    setShowDeliveryInfo(true);
  };

  const handleShowRoute = () => {
    setShowDeliveryInfo(false);
    setShowRouteInfo(true);
  };

  // Funciones para navegación
  const handleBackToGroup = () => {
    // Feedback háptico
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    (navigation as any).navigate("Groups", {
      screen: "CreateGroup",
    });
  };

  const handleCancelGroup = () => {
    // Feedback háptico
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCancelConfirmation(true);
  };

  const confirmCancelGroup = () => {
    setIsCreatingGroup(false);
    // Limpiar solo el estado de grupo (sin productos)
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
        ]}
      >
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
                activeOpacity={0.8}
              >
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
                onPress={handleBackToGroup}
              >
                <Text style={containerStyles.groupActionIcon}>👥</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  containerStyles.groupActionButton,
                  containerStyles.cancelButton,
                ]}
                onPress={handleCancelGroup}
              >
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
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <SearchBar searchQuery={searchText} onSearchChange={setSearchText} />

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            categories={allCategories}
            brands={brands}
          />
        )}

        {/* Toggle Filters Button */}
        <TouchableOpacity
          style={{ marginBottom: 16, alignSelf: "flex-end" }}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={{ color: "#FF6B35", fontWeight: "600" }}>
            {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          </Text>
        </TouchableOpacity>

        {/* Product Grid */}
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

      {/* Bottom Sheet del carrito */}
      <CartBottomSheet
        visible={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          if (cartProducts.length > 0) {
            const cartProd = cartProducts[0];
            const fullProduct = products.find((p) => p.id === cartProd.id);
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

      {/* Delivery Modal */}
      <DeliveryModal
        visible={showDeliveryModal}
        onClose={closeDeliveryModal}
        onSelectPickup={handleCreateCircularGroup}
        onSelectDelivery={handleHomeDelivery}
      />

      {/* Product Added Modal */}
      <ProductAddedModal
        visible={showProductAddedModal}
        onContinueAdding={handleContinueAddingProducts}
        onContinueGroup={handleContinueCreatingGroup}
      />

      {/* Alerta de confirmación para cancelar grupo */}
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

      {/* Alerta de información de entrega */}
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

      {/* Alerta de información de ruta */}
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
      {/* Modal para elegir grupo existente */}
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
  headerCartIcon: {
    // El icono ahora es un componente, así que solo ajusta el tamaño si es necesario
  },
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
