import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { WalletData } from "../types";
import { walletCardStyles } from "../styles";

interface WalletBalanceCardProps {
  walletData: WalletData;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  walletData,
}) => {
  return (
    <Card style={walletCardStyles.walletCard}>
      <View style={walletCardStyles.walletContent}>
        <View style={walletCardStyles.walletLeft}>
          <Text style={walletCardStyles.availableLabel}>Disponible:</Text>
          <View style={walletCardStyles.balanceContainer}>
            <BeCoinIcon width={24} height={24} />
            <Text style={walletCardStyles.balanceAmount}>
              {walletData.balance}
            </Text>
          </View>
          <Text style={walletCardStyles.estimatedValue}>
            Total estimado: ${walletData.estimatedValue} USD
          </Text>
        </View>
        <View style={walletCardStyles.avatarContainer}>
          <View style={walletCardStyles.walletAvatar} />
        </View>
      </View>
    </Card>
  );
};
