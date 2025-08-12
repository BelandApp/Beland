import React, { useState } from "react";
import { View, ScrollView, Dimensions } from "react-native";
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

  type PaymentAccountType = "payphone" | "bank" | null;
  const { walletData } = useWalletData();
  const { mainWalletActions } = useWalletActions();
  const { transactions, isLoading: transactionsLoading } =
    useWalletTransactions();
  const [showPayphone, setShowPayphone] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PaymentAccountType>(null);

  // Obtener variables de entorno
  const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN || "";
  const payphoneStoreId = process.env.EXPO_PUBLIC_PAYPHONE_STOREID || "";
  const [payphoneUrl, setPayphoneUrl] = useState<string>("");
  const payphoneProps = {
    token: payphoneToken,
    amount: 315,
    amountWithoutTax: 200,
    amountWithTax: 100,
    tax: 15,
    service: 0,
    tip: 0,
    storeId: payphoneStoreId,
    reference: "Motivo de Pago",
    currency: "USD",
    clientTransactionId: "ID-UNICO-X-TRANSACCION",
    backgroundColor: "#F88D2A",
    urlMobile: payphoneUrl,
  };
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Widget Payphone solo si está seleccionado y showPayphone */}
      {showPayphone && selectedAccount === "payphone" ? (
        <PayphoneWidget
          {...payphoneProps}
          onClose={() => setShowPayphone(false)}
        />
      ) : (
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
      )}
    </View>
  );
};
