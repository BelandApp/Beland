import React from "react";
import { View, TextInput } from "react-native";
import { styles } from "@screens/RecyclingMap/styles/FilterStyles";
import { colors } from "@styles/colors";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar = ({ value, onChangeText }: SearchBarProps) => (
  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Buscar por nombre o dirección..."
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor={colors.textSecondary}
    />
  </View>
);
