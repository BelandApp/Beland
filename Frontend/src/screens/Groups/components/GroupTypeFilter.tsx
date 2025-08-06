import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { groupFilterStyles } from "../styles";

interface GroupTypeFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  availableTypes: string[];
}

export const GroupTypeFilter: React.FC<GroupTypeFilterProps> = ({
  selectedType,
  onTypeChange,
  availableTypes,
}) => {
  return (
    <View style={groupFilterStyles.filterContainer}>
      <Text style={groupFilterStyles.filterTitle}>Filtrar por tipo:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={groupFilterStyles.filterScroll}
        contentContainerStyle={groupFilterStyles.filterContent}
      >
        {/* Opción "Todos" */}
        <TouchableOpacity
          style={[
            groupFilterStyles.filterChip,
            selectedType === null && groupFilterStyles.filterChipActive,
          ]}
          onPress={() => onTypeChange(null)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              groupFilterStyles.filterChipText,
              selectedType === null && groupFilterStyles.filterChipTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {/* Opciones de tipos disponibles */}
        {availableTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              groupFilterStyles.filterChip,
              selectedType === type && groupFilterStyles.filterChipActive,
            ]}
            onPress={() => onTypeChange(type)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                groupFilterStyles.filterChipText,
                selectedType === type && groupFilterStyles.filterChipTextActive,
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
