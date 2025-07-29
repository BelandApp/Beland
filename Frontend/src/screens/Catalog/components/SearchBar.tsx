import React from "react";
import { View, TextInput } from "react-native";
import { searchFilterStyles } from "../styles";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = "Buscar productos...",
}) => {
  return (
    <View style={searchFilterStyles.searchContainer}>
      <TextInput
        style={searchFilterStyles.searchBar}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );
};
