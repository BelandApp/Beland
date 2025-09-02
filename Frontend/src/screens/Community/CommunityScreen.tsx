import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { colors } from "../../styles/colors";
import { Resource, ResourceCategory } from "../../types/resource";
import { resourceService } from "../../services/resourceService";
import { useCustomAlert } from "../../hooks/useCustomAlert";

// Components
import { CommunityHeader, CategoryFilter, ResourcesGrid } from "./components";

// Styles
import { containerStyles } from "./styles";

export const CommunityScreen = () => {
  // Estado para recursos y categorías
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Hooks personalizados
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  // Cargar recursos
  const loadResources = async (pageNum = 1, categoryId = "", reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const response = await resourceService.getResources({
        page: pageNum,
        limit: 20,
        category_id: categoryId || undefined,
      });

      if (reset || pageNum === 1) {
        setResources(response.resources);
      } else {
        setResources((prev) => [...prev, ...response.resources]);
      }

      setHasMore(pageNum < response.totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error("Error cargando recursos:", error);
      showCustomAlert(
        "Error",
        "No se pudieron cargar los recursos. Inténtalo de nuevo.",
        "error"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const response = await resourceService.getCategories();
      setCategories([
        {
          id: "",
          category_name: "Todas",
          category_desc: "",
          created_at: "",
          updated_at: "",
        },
        ...response.categories,
      ]);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // Efectos
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadCategories(), loadResources(1, "", true)]);
    };

    initializeData();
  }, []);

  // Manejar cambio de categoría
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadResources(1, categoryId, true);
  };

  // Manejar refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadResources(1, selectedCategory, true);
  };

  // Manejar cargar más
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadResources(page + 1, selectedCategory, false);
    }
  };

  // Manejar compra de recurso
  const handlePurchaseResource = (resource: Resource) => {
    // TODO: Implementar navegación a PaymentScreen con el recurso
    console.log("Comprando recurso:", resource);
    showCustomAlert(
      "Funcionalidad en desarrollo",
      "La compra de recursos estará disponible próximamente.",
      "info"
    );
  };

  if (loading && resources.length === 0) {
    return (
      <View
        style={[
          containerStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textPrimary }}>
          Cargando recursos...
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyles.container}>
      <CommunityHeader />

      <ScrollView
        style={containerStyles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        onMomentumScrollEnd={(event) => {
          const { layoutMeasurement, contentOffset, contentSize } =
            event.nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
      >
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
        />

        <ResourcesGrid
          resources={resources}
          onPurchase={handlePurchaseResource}
          loading={loading && page > 1}
        />

        {loading && page > 1 && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ marginTop: 8, color: colors.textPrimary }}>
              Cargando más recursos...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Alertas */}
      {showAlert && (
        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      )}
    </View>
  );
};
