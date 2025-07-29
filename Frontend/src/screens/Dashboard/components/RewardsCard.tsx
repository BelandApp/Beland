import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../../components/ui/Card";
import { GiftIcon } from "../../../components/icons";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { rewardsCardStyles } from "../styles";

export const RewardsCard: React.FC = () => {
  return (
    <Card style={rewardsCardStyles.rewardsCard} backgroundColor="#E3F2FD">
      <View style={rewardsCardStyles.rewardsContent}>
        <View style={rewardsCardStyles.rewardsIcon}>
          <GiftIcon width={32} height={32} color="#1976D2" />
        </View>
        <View style={rewardsCardStyles.rewardsText}>
          <View style={rewardsCardStyles.rewardsTextContainer}>
            <Text style={rewardsCardStyles.rewardsTitle}>Ganá 10</Text>
            <BeCoinIcon width={18} height={18} />
          </View>
          <Text style={rewardsCardStyles.rewardsSubtitle}>
            por cada botella
          </Text>
        </View>
        <View style={rewardsCardStyles.hotBadge}>
          <Text style={rewardsCardStyles.hotText}>HOT</Text>
        </View>
      </View>
    </Card>
  );
};
