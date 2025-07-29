import React from "react";
import { View, ScrollView, TouchableOpacity, Text } from "react-native";
import { RewardCategory } from "../types";
import { REWARD_CATEGORIES } from "../types/rewardsData";
import { categoryStyles } from "../styles";

interface CategoryFilterProps {
  selectedCategory: RewardCategory;
  onCategorySelect: (category: RewardCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect,
}) => {
  return (
    <View style={categoryStyles.categoriesSection}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={categoryStyles.categoriesScroll}
      >
        {REWARD_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              categoryStyles.categoryButton,
              selectedCategory === category &&
                categoryStyles.categoryButtonActive,
            ]}
            onPress={() => onCategorySelect(category)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                categoryStyles.categoryText,
                selectedCategory === category &&
                  categoryStyles.categoryTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
