import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { Reward } from "../types";
import { rewardCardStyles } from "../styles";

interface RewardCardProps {
  reward: Reward;
  canAfford: boolean;
  onClaim: (reward: Reward) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  canAfford,
  onClaim,
}) => {
  const isDisabled = !reward.available || !canAfford;

  return (
    <Card style={rewardCardStyles.rewardCard}>
      {reward.popular && (
        <View style={rewardCardStyles.popularBadge}>
          <Text style={rewardCardStyles.popularText}>POPULAR</Text>
        </View>
      )}

      <View style={rewardCardStyles.rewardImageContainer}>
        <Text style={rewardCardStyles.rewardEmoji}>{reward.image}</Text>
      </View>

      <View style={rewardCardStyles.rewardContent}>
        <Text style={rewardCardStyles.rewardTitle}>{reward.title}</Text>
        <Text style={rewardCardStyles.rewardDescription}>
          {reward.description}
        </Text>

        {reward.discount && (
          <View style={rewardCardStyles.discountBadge}>
            <Text style={rewardCardStyles.discountText}>
              {reward.discount} OFF
            </Text>
          </View>
        )}

        <View style={rewardCardStyles.rewardFooter}>
          <View style={rewardCardStyles.costContainer}>
            <BeCoinIcon width={16} height={16} />
            <Text style={rewardCardStyles.costText}>{reward.cost}</Text>
          </View>

          <TouchableOpacity
            style={[
              rewardCardStyles.claimButton,
              isDisabled && rewardCardStyles.claimButtonDisabled,
            ]}
            onPress={() => onClaim(reward)}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            <Text
              style={[
                rewardCardStyles.claimButtonText,
                isDisabled && rewardCardStyles.claimButtonTextDisabled,
              ]}
            >
              {!reward.available
                ? "Agotado"
                : !canAfford
                ? "Sin saldo"
                : "Canjear"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};
