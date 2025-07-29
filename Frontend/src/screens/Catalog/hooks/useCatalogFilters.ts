import { useState } from "react";

export interface FilterOptions {
  categories: string[];
  brands: string[];
  minPrice: string;
  maxPrice: string;
  sortBy: "name" | "price" | "brand";
}

export const useCatalogFilters = () => {
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    brands: [],
    minPrice: "",
    maxPrice: "",
    sortBy: "name",
  });
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      minPrice: "",
      maxPrice: "",
      sortBy: "name",
    });
    setSearchText("");
  };

  return {
    searchText,
    setSearchText,
    filters,
    setFilters,
    updateFilter,
    resetFilters,
    showFilters,
    setShowFilters,
  };
};
