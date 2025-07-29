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
      brands: [],
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
    });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const toggleBrand = (brand: string) => {
    const newBrands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];

    onFiltersChange({
      ...filters,
      brands: newBrands,
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
                filters.categories.includes(category) &&
                  searchFilterStyles.filterChipActive,
              ]}
              onPress={() => toggleCategory(category)}
            >
              <Text
                style={[
                  searchFilterStyles.filterChipText,
                  filters.categories.includes(category) &&
                    searchFilterStyles.filterChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Marcas */}
      <View style={searchFilterStyles.filterSection}>
        <Text style={searchFilterStyles.filterSectionTitle}>Marcas</Text>
        <View style={searchFilterStyles.filterRow}>
          {brands.map((brand) => (
            <TouchableOpacity
              key={brand}
              style={[
                searchFilterStyles.filterChip,
                filters.brands.includes(brand) &&
                  searchFilterStyles.filterChipActive,
              ]}
              onPress={() => toggleBrand(brand)}
            >
              <Text
                style={[
                  searchFilterStyles.filterChipText,
                  filters.brands.includes(brand) &&
                    searchFilterStyles.filterChipTextActive,
                ]}
              >
                {brand}
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
      </View>
    </View>
  );
};
