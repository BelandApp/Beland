import { useMemo } from "react";
import { AVAILABLE_PRODUCTS } from "../../../data/products";
import { FilterOptions } from "./useCatalogFilters";

export const useProductFiltering = (
  searchText: string,
  filters: FilterOptions
) => {
  const categories = useMemo(
    () => [...new Set(AVAILABLE_PRODUCTS.map((p) => p.category))],
    []
  );

  // Como no tenemos marcas reales, creamos marcas básicas basadas en el nombre del producto
  const brands = useMemo(
    () => ["Marca A", "Marca B", "Marca C", "Sin marca"],
    []
  );

  const filteredProducts = useMemo(() => {
    let products = AVAILABLE_PRODUCTS.filter((product) => {
      // Búsqueda por texto
      const matchesSearch =
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category.toLowerCase().includes(searchText.toLowerCase());

      // Filtro por categorías
      const matchesCategory =
        filters.categories.length === 0 ||
        filters.categories.includes(product.category);

      // Para el filtro de marcas, por ahora siempre coincide ya que no tenemos marcas reales
      const matchesBrand = filters.brands.length === 0;

      // Filtro por rango de precio
      const matchesPrice = (() => {
        const minPrice = filters.minPrice ? parseFloat(filters.minPrice) : 0;
        const maxPrice = filters.maxPrice
          ? parseFloat(filters.maxPrice)
          : Infinity;
        return product.basePrice >= minPrice && product.basePrice <= maxPrice;
      })();

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
    });

    // Ordenamiento
    products.sort((a, b) => {
      switch (filters.sortBy) {
        case "price":
          return a.basePrice - b.basePrice;
        case "brand":
          // Como no tenemos marcas, ordenar por nombre
          return a.name.localeCompare(b.name);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return products;
  }, [searchText, filters]);

  return {
    categories,
    brands,
    filteredProducts,
  };
};
