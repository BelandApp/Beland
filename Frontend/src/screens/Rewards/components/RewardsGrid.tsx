import React from "react";
import { View, Text } from "react-native";
import { Reward } from "../types";
import { RewardCard } from "./RewardCard";
import { rewardCardStyles } from "../styles";

interface RewardsGridProps {
  rewards: Reward[];
  canAffordReward: (reward: Reward) => boolean;
  onClaimReward: (reward: Reward) => void;
  sectionTitle?: string;
}

export const RewardsGrid: React.FC<RewardsGridProps> = ({
  rewards,
  canAffordReward,
  onClaimReward,
  sectionTitle = "Recompensas Disponibles",
}) => {
  if (rewards.length === 0) {
    return (
      <View style={rewardCardStyles.rewardsSection}>
        <Text style={rewardCardStyles.sectionTitle}>{sectionTitle}</Text>
        <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
          No hay recompensas disponibles en esta categoría
        </Text>
      </View>
    );
  }

  return (
    <View style={rewardCardStyles.rewardsSection}>
      <Text style={rewardCardStyles.sectionTitle}>{sectionTitle}</Text>
      <View style={rewardCardStyles.rewardsGrid}>
        {rewards.map((reward) => (
          <RewardCard
            key={reward.id}
            reward={reward}
            canAfford={canAffordReward(reward)}
            onClaim={onClaimReward}
          />
        ))}
      </View>
    </View>
  );
};
