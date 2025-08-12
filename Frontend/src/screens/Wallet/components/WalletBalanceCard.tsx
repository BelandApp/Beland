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
                  width: "100%",
                  height: "100%",
                  borderRadius: 40,
                }}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={walletCardStyles.walletAvatar}>
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 40,
                  backgroundColor: "rgba(255,255,255,0.5)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#666",
                  }}
                >
                  👤
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};
