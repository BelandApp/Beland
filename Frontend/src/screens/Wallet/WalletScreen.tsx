import React, { useState, useEffect } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { WaveBottomGray } from "../../components/icons";
import {
  WalletHeader,
  WalletBalanceCard,
  WalletActions,
  RecentTransactions,
} from "./components";
import { useAuth } from "../../hooks/AuthContext";

import {
  useWalletData,
  useWalletActions,
  useWalletTransactions,
} from "./hooks";
import { containerStyles } from "./styles";
import { PayphoneWidget } from "../../components/ui/PayphoneWidget";
import { StyleSheet } from "react-native";

const payphoneLogo = require("../../../assets/payphone-logo.png");

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();

  const { walletData, refetch: refetchWallet } = useWalletData();
  const { mainWalletActions } = useWalletActions();
  const {
    transactions,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
  } = useWalletTransactions();

  // Actualizar transacciones al volver a la pantalla
  const nav = useNavigation();
  useEffect(() => {
    const unsubscribe = nav.addListener("focus", () => {
      // Si venimos de una recarga exitosa, forzar refetch del saldo y transacciones
      refetchWallet();
      refetchTransactions();
    });
    return unsubscribe;
  }, [nav, refetchWallet, refetchTransactions]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "#fff" }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={containerStyles.content}>
            <WalletHeader />
            <WalletBalanceCard
              walletData={walletData}
              avatarUrl={user?.picture}
            />
            <WalletActions actions={mainWalletActions} />

            {/* Transacciones recientes */}
            <RecentTransactions
              transactions={transactions}
              isLoading={transactionsLoading}
            />
          </View>
          <View style={containerStyles.waveContainer}>
            <WaveBottomGray
              width={Dimensions.get("window").width}
              height={120}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
