import React from "react";
import { View, Text, Image } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { WalletData } from "../types";
import { walletCardStyles } from "../styles";

interface WalletBalanceCardProps {
  walletData: WalletData;
  backgroundColor?: string;
  avatarUrl?: string;
  accentColor?: string;
  hideEstimated?: boolean;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  walletData,
  backgroundColor,
  avatarUrl,
  accentColor,
  hideEstimated,
}) => {
  return (
    <Card
      style={{
        ...walletCardStyles.walletCard,
        ...(backgroundColor ? { backgroundColor } : {}),
      }}
    >
      <View style={walletCardStyles.walletContent}>
        <View style={walletCardStyles.walletLeft}>
          <Text style={walletCardStyles.availableLabel}>Disponible:</Text>
          <View style={walletCardStyles.balanceContainer}>
            <BeCoinIcon width={24} height={24} />
            <Text
              style={[
                walletCardStyles.balanceAmount,
                accentColor ? { color: accentColor } : {},
              ]}
            >
              {walletData.balance}
            </Text>
          </View>
          {!hideEstimated && (
            <Text style={walletCardStyles.estimatedValue}>
              Total estimado: ${walletData.estimatedValue} USD
            </Text>
          )}
        </View>
        <View style={walletCardStyles.avatarContainer}>
          {avatarUrl ? (
            <View style={walletCardStyles.walletAvatar}>
              <Image
                source={
                  typeof avatarUrl === "string" ? { uri: avatarUrl } : avatarUrl
                }
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#eee",
                }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={walletCardStyles.walletAvatar} />
          )}
        </View>
      </View>
    </Card>
  );
};
