import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { ResourceCategory } from "../../../types/resource";
import { categoryStyles } from "../styles";

interface CategoryFilterProps {
  categories: ResourceCategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={categoryStyles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={categoryStyles.scrollContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              categoryStyles.categoryButton,
              selectedCategory === category.id &&
                categoryStyles.categoryButtonActive,
            ]}
            onPress={() => onSelectCategory(category.id)}
          >
            <Text
              style={[
                categoryStyles.categoryText,
                selectedCategory === category.id &&
                  categoryStyles.categoryTextActive,
              ]}
            >
              {category.category_name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
