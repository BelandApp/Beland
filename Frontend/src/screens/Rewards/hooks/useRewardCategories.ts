import { useState } from "react";
import { RewardCategory } from "../types";

export const useRewardCategories = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<RewardCategory>("Todos");

  const selectCategory = (category: RewardCategory) => {
    setSelectedCategory(category);
  };

  const isAllCategories = selectedCategory === "Todos";

  return {
    selectedCategory,
    setSelectedCategory,
    selectCategory,
    isAllCategories,
  };
};
