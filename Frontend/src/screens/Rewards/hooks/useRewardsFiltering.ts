import { useMemo } from "react";
import { Reward, RewardCategory } from "../types";
import { REWARDS_DATA } from "../types/rewardsData";

export const useRewardsFiltering = (selectedCategory: RewardCategory) => {
  const filteredRewards = useMemo(() => {
    if (selectedCategory === "Todos") {
      return REWARDS_DATA;
    }
    return REWARDS_DATA.filter(
      (reward) => reward.category === selectedCategory
    );
  }, [selectedCategory]);

  const availableRewards = useMemo(() => {
    return filteredRewards.filter((reward) => reward.available);
  }, [filteredRewards]);

  const popularRewards = useMemo(() => {
    return filteredRewards.filter((reward) => reward.popular);
  }, [filteredRewards]);

  return {
    allRewards: REWARDS_DATA,
    filteredRewards,
    availableRewards,
    popularRewards,
    totalRewards: filteredRewards.length,
    availableCount: availableRewards.length,
    popularCount: popularRewards.length,
  };
};
