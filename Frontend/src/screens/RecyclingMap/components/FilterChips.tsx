import React from "react";
import { ScrollView, TouchableOpacity, Text } from "react-native";
import { styles } from "@screens/RecyclingMap/styles/FilterStyles";
import { RECYCLING_TYPES } from "src/data/recyclingData";

interface FilterChipsProps {
  selectedFilters: string[];
  toggleFilter: (wasteType: string) => void;
}

export const FilterChips = ({
  selectedFilters,
  toggleFilter,
}: FilterChipsProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={styles.filtersContainer}
    contentContainerStyle={styles.filtersContent}
  >
    {RECYCLING_TYPES.map(
      (type: { id: string; name: string; emoji: string }) => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.filterChip,
            selectedFilters.includes(type.id) && styles.activeFilterChip,
          ]}
          onPress={() => toggleFilter(type.id)}
        >
          <Text style={styles.filterEmoji}>{type.emoji}</Text>
          <Text
            style={[
              styles.filterText,
              selectedFilters.includes(type.id) && styles.activeFilterText,
            ]}
          >
            {type.name}
          </Text>
        </TouchableOpacity>
      )
    )}
  </ScrollView>
);
