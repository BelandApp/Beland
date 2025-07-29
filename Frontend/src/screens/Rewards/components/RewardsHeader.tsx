import React from "react";
import { View, Text } from "react-native";
import { BeCoinsBalance } from "../../../components/ui/BeCoinsBalance";
import { headerStyles } from "../styles";

export const RewardsHeader: React.FC = () => {
  return (
    <View style={headerStyles.header}>
      <View style={headerStyles.headerTextContainer}>
        <Text style={headerStyles.headerTitle}>Premios</Text>
        <Text style={headerStyles.headerSubtitle}>
          Canjea tus BeCoins por increíbles recompensas
        </Text>
      </View>
      <BeCoinsBalance
        size="medium"
        variant="header"
        style={headerStyles.coinsDisplay}
      />
    </View>
  );
};
