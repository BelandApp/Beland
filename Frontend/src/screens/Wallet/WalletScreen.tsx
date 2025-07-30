import React, { useState } from "react";
import { createPayphonePayment } from "../../services/payphoneService";
import {
  View,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { WaveBottomGray } from "../../components/icons";
import {
  WalletHeader,
  WalletBalanceCard,
  WalletActions,
  FRSCard,
} from "./components";
import { BankAccountsSection } from "./components/BankAccountsSection";
import { PayphoneSection } from "./components/PayphoneSection";
import { BankAccountsList } from "./components/BankAccountsList";
// import { BuyDigitalCurrencyModal } from "./components/BuyDigitalCurrencyModal";
import { PaymentPreferences } from "./components/PaymentPreferences";
import type { PaymentAccountType } from "./components/PaymentPreferences";
import { PaymentAccountForm } from "./components/PaymentAccountForm";
import { useWalletData, useWalletActions } from "./hooks";
import { containerStyles } from "./styles";
import { PayphoneWidget } from "../../components/ui/PayphoneWidget";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Image,
} from "react-native";

const payphoneLogo = require("../../../assets/payphone-logo.png");

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [bankAccounts, setBankAccounts] = useState<
    {
      holder: string;
      idNumber: string;
      bank: string;
      accountNumber: string;
    }[]
  >([]);
  // const [showBuyModal, setShowBuyModal] = useState(false);
  const handleAddBankAccount = () => {
    if (
      bankData.holder &&
      bankData.idNumber &&
      bankData.bank &&
      bankData.accountNumber
    ) {
      setBankAccounts([...bankAccounts, bankData]);
      setBankData({ holder: "", idNumber: "", bank: "", accountNumber: "" });
    }
  };

  const handleRemoveBankAccount = (idx: number) => {
    setBankAccounts(bankAccounts.filter((_, i) => i !== idx));
  };

  // const handleBuyDigitalCurrency = (amount: string, currency: string) => {
  //   // Aquí iría la lógica de compra
  //   setShowBuyModal(false);
  // };
  const { walletData, frsData } = useWalletData();
  const { walletActions } = useWalletActions();
  const [showPayphone, setShowPayphone] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<PaymentAccountType>(null);
  const [editAccount, setEditAccount] = useState(false);
  const [bankData, setBankData] = useState({
    holder: "",
    idNumber: "",
    bank: "",
    accountNumber: "",
  });
  const [payphoneData, setPayphoneData] = useState({ phone: "" });

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
    backgroundColor: "#6610f2",
    urlMobile: payphoneUrl,
  };
  // Necesita acceso a navigation
  // @ts-ignore
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
              <WalletBalanceCard walletData={walletData} />
              <WalletActions
                actions={walletActions.map((action) =>
                  action.id === "send"
                    ? {
                        ...action,
                        onPress: () => {
                          setShowAccountModal(true);
                        },
                      }
                    : action.id === "exchange"
                    ? {
                        ...action,
                        onPress: () => {
                          navigation.navigate("BuyDigitalCurrencyScreen");
                        },
                      }
                    : action
                )}
              />

              {/* Modal para elegir tipo de cuenta */}
              <PaymentPreferences
                showAccountModal={showAccountModal}
                setShowAccountModal={setShowAccountModal}
                selectedAccount={selectedAccount}
                setSelectedAccount={setSelectedAccount}
                payphoneLogo={payphoneLogo}
                styles={styles}
              />

              {selectedAccount && (
                <View style={{ marginTop: 12, marginBottom: 8 }}>
                  {editAccount && selectedAccount === "bank" && (
                    <BankAccountsSection
                      bankAccounts={bankAccounts}
                      bankData={bankData}
                      editAccount={editAccount}
                      onChangeBankData={(data) =>
                        setBankData(data as typeof bankData)
                      }
                      onAddBankAccount={handleAddBankAccount}
                      onRemoveBankAccount={handleRemoveBankAccount}
                    />
                  )}
                  {editAccount && selectedAccount === "payphone" && (
                    <PayphoneSection
                      payphoneData={payphoneData}
                      editAccount={editAccount}
                      onChangePayphoneData={(data) =>
                        setPayphoneData(data as typeof payphoneData)
                      }
                    />
                  )}
                </View>
              )}
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

const styles = StyleSheet.create({
  paymentPrefCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  paymentPrefHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentPrefTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  addBtn: {
    backgroundColor: "#e6f0ff",
    borderRadius: 50,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    color: "#6610f2",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: -2,
  },
  noAccountText: {
    color: "#888",
    fontSize: 15,
    textAlign: "center",
    marginVertical: 18,
  },
  selectedAccountBox: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#6610f2",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  accountLogo: {
    width: 32,
    height: 32,
    marginRight: 10,
    resizeMode: "contain",
    borderRadius: 8,
  },
  accountText: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  bankIcon: {
    fontSize: 28,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: 320,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#222",
  },
  accountOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    width: 240,
  },
  closeModalBtn: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
  },
});
