import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { searchFilterStyles } from "../styles";
import { FilterOptions } from "../hooks";

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categories: string[];
  brands: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  categories,
  brands,
}) => {
  const clearFilters = () => {
    onFiltersChange({
      categories: [],
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
      order: "ASC",
    });
  };
  const setOrder = (order: "ASC" | "DESC") => {
    onFiltersChange({
      ...filters,
      order,
    });
  };

  // Solo permitir una categoría seleccionada a la vez
  const selectCategory = (category: string) => {
    onFiltersChange({
      ...filters,
      categories: filters.categories[0] === category ? [] : [category],
    });
  };

  const setSortBy = (sortBy: "name" | "price" | "brand") => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const setPriceRange = (minPrice: string, maxPrice: string) => {
    onFiltersChange({
      ...filters,
      minPrice,
      maxPrice,
    });
  };

  return (
    <View style={searchFilterStyles.filterPanel}>
      <View style={searchFilterStyles.filterHeader}>
        <Text style={searchFilterStyles.filterTitle}>Filtros</Text>
        <TouchableOpacity
          style={searchFilterStyles.clearFiltersButton}
          onPress={clearFilters}
        >
          <Text style={searchFilterStyles.clearFiltersText}>Limpiar</Text>
        </TouchableOpacity>
      </View>

      {/* Categorías */}
      <View style={searchFilterStyles.filterSection}>
        <Text style={searchFilterStyles.filterSectionTitle}>Categorías</Text>
        <View style={searchFilterStyles.filterRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                searchFilterStyles.filterChip,
                filters.categories[0] === category &&
                  searchFilterStyles.filterChipActive,
              ]}
              onPress={() => selectCategory(category)}
            >
              <Text
                style={[
                  searchFilterStyles.filterChipText,
                  filters.categories[0] === category &&
                    searchFilterStyles.filterChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Rango de precio */}
      <View style={searchFilterStyles.filterSection}>
        <Text style={searchFilterStyles.filterSectionTitle}>Precio</Text>
        <View style={searchFilterStyles.priceRange}>
          <TextInput
            style={searchFilterStyles.priceInput}
            placeholder="Min"
            value={filters.minPrice}
            onChangeText={(text) => setPriceRange(text, filters.maxPrice)}
            keyboardType="numeric"
          />
          <Text style={searchFilterStyles.priceSeparator}>-</Text>
          <TextInput
            style={searchFilterStyles.priceInput}
            placeholder="Max"
            value={filters.maxPrice}
            onChangeText={(text) => setPriceRange(filters.minPrice, text)}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Ordenamiento */}
      <View style={searchFilterStyles.filterSection}>
        <Text style={searchFilterStyles.filterSectionTitle}>Ordenar por</Text>
        <View style={searchFilterStyles.filterRow}>
          {(
            [
              { key: "name", label: "Nombre" },
              { key: "price", label: "Precio" },
              { key: "brand", label: "Marca" },
            ] as const
          ).map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                searchFilterStyles.filterChip,
                filters.sortBy === key && searchFilterStyles.filterChipActive,
              ]}
              onPress={() => setSortBy(key)}
            >
              <Text
                style={[
                  searchFilterStyles.filterChipText,
                  filters.sortBy === key &&
                    searchFilterStyles.filterChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Selector de orden ascendente/descendente mejorado */}
        <View style={searchFilterStyles.filterRow}>
          <TouchableOpacity
            style={[
              searchFilterStyles.filterChip,
              filters.order === "ASC" && searchFilterStyles.filterChipActive,
            ]}
            onPress={() => setOrder("ASC")}
          >
            <Text
              style={[
                searchFilterStyles.filterChipText,
                filters.order === "ASC" &&
                  searchFilterStyles.filterChipTextActive,
              ]}
            >
              ↑ Ascendente
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              searchFilterStyles.filterChip,
              filters.order === "DESC" && searchFilterStyles.filterChipActive,
            ]}
            onPress={() => setOrder("DESC")}
          >
            <Text
              style={[
                searchFilterStyles.filterChipText,
                filters.order === "DESC" &&
                  searchFilterStyles.filterChipTextActive,
              ]}
            >
              ↓ Descendente
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
