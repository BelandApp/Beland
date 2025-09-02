import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Card } from "../../../components/ui/Card";
import { CommunityIcon } from "../../../components/icons";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { rewardsCardStyles } from "../styles";

export const CommunityCard: React.FC = () => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate("Community" as never);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Card style={rewardsCardStyles.rewardsCard} backgroundColor="#E8F5E8">
        <View style={rewardsCardStyles.rewardsContent}>
          <View style={rewardsCardStyles.rewardsIcon}>
            <CommunityIcon width={32} height={32} color="#4CAF50" />
          </View>
          <View style={rewardsCardStyles.rewardsText}>
            <View style={rewardsCardStyles.rewardsTextContainer}>
              <Text style={rewardsCardStyles.rewardsTitle}>Comunidad</Text>
            </View>
            <Text style={rewardsCardStyles.rewardsSubtitle}>
              Descubre recursos sostenibles
            </Text>
          </View>
          <View style={rewardsCardStyles.hotBadge}>
            <Text style={rewardsCardStyles.hotText}>NUEVO</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
