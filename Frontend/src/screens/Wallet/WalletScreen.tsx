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
import { PaymentPreferences } from "./components/PaymentPreferences";
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

type PaymentAccountType = "payphone" | "bank" | null;

export const WalletScreen: React.FC = () => {
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
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Modal para elegir tipo de cuenta */}
      <Modal
        visible={showAccountModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Añadir método de pago</Text>
            <Pressable
              style={styles.accountOption}
              onPress={() => {
                setSelectedAccount("payphone");
                setShowAccountModal(false);
              }}
            >
              <Image source={payphoneLogo} style={styles.accountLogo} />
              <Text style={styles.accountText}>Cuenta de Payphone</Text>
            </Pressable>
            <Pressable
              style={styles.accountOption}
              onPress={() => {
                setSelectedAccount("bank");
                setShowAccountModal(false);
              }}
            >
              <Text style={styles.bankIcon}>🏦</Text>
              <Text style={styles.accountText}>Cuenta Bancaria</Text>
            </Pressable>
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setShowAccountModal(false)}
            >
              <Text style={{ color: "#6610f2", fontWeight: "bold" }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
                          if (selectedAccount === "payphone") {
                            // Usar el browser_fallback_url directo para pruebas en mobile
                            setPayphoneUrl(
                              process.env.EXPO_PUBLIC_PAYPHONE_BUTTON_URL || ""
                            );
                            setShowPayphone(true);
                          }
                          // Aquí podrías manejar lógica para banco si lo deseas
                        },
                      }
                    : action
                )}
              />

              <PaymentPreferences
                showAccountModal={showAccountModal}
                setShowAccountModal={setShowAccountModal}
                selectedAccount={selectedAccount}
                setSelectedAccount={(type) => {
                  setSelectedAccount(type);
                  setEditAccount(true);
                }}
                payphoneLogo={payphoneLogo}
                styles={styles}
              />
              {/* Formulario de datos de cuenta y aclaraciones */}
              {selectedAccount && (
                <View style={{ marginTop: 12, marginBottom: 8 }}>
                  {editAccount ? (
                    <View
                      style={{
                        backgroundColor: "#f6f8ff",
                        borderRadius: 14,
                        padding: 16,
                        shadowColor: "#000",
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        elevation: 2,
                        borderWidth: 1,
                        borderColor:
                          selectedAccount === "bank" ? "#4caf50" : "#6610f2",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "bold",
                          fontSize: 16,
                          color:
                            selectedAccount === "bank" ? "#388e3c" : "#6610f2",
                          marginBottom: 8,
                          textAlign: "center",
                        }}
                      >
                        {selectedAccount === "bank"
                          ? "Datos de cuenta bancaria"
                          : "Datos de PayPhone"}
                      </Text>
                      <PaymentAccountForm
                        type={selectedAccount}
                        value={
                          selectedAccount === "bank" ? bankData : payphoneData
                        }
                        onChange={
                          selectedAccount === "bank"
                            ? (data) => setBankData(data as typeof bankData)
                            : (data) =>
                                setPayphoneData(data as typeof payphoneData)
                        }
                      />
                      <Text
                        style={{
                          color:
                            selectedAccount === "bank" ? "#388e3c" : "#6610f2",
                          fontSize: 13,
                          marginBottom: 10,
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {selectedAccount === "bank"
                          ? "La carga de monedas es gratuita."
                          : "Con PayPhone hay un recargo del 5% + IVA."}
                      </Text>
                      <TouchableOpacity
                        style={{
                          alignSelf: "center",
                          backgroundColor:
                            selectedAccount === "bank" ? "#4caf50" : "#6610f2",
                          borderRadius: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 24,
                          marginTop: 4,
                        }}
                        onPress={() => setEditAccount(false)}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 15,
                          }}
                        >
                          Guardar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: "#f8f8f8",
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor:
                          selectedAccount === "bank" ? "#4caf50" : "#6610f2",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color:
                            selectedAccount === "bank" ? "#388e3c" : "#6610f2",
                          fontWeight: "bold",
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {selectedAccount === "bank"
                          ? "Cuenta bancaria"
                          : "Cuenta PayPhone"}
                      </Text>
                      {selectedAccount === "bank" && (
                        <View>
                          <Text style={{ color: "#444", marginBottom: 2 }}>
                            Titular:{" "}
                            <Text style={{ fontWeight: "bold" }}>
                              {bankData.holder || "-"}
                            </Text>
                          </Text>
                          <Text style={{ color: "#444", marginBottom: 2 }}>
                            Cédula:{" "}
                            <Text style={{ fontWeight: "bold" }}>
                              {bankData.idNumber || "-"}
                            </Text>
                          </Text>
                          <Text style={{ color: "#444", marginBottom: 2 }}>
                            Banco:{" "}
                            <Text style={{ fontWeight: "bold" }}>
                              {bankData.bank || "-"}
                            </Text>
                          </Text>
                          <Text style={{ color: "#444", marginBottom: 2 }}>
                            N° cuenta:{" "}
                            <Text style={{ fontWeight: "bold" }}>
                              {bankData.accountNumber || "-"}
                            </Text>
                          </Text>
                        </View>
                      )}
                      {selectedAccount === "payphone" && (
                        <View>
                          <Text style={{ color: "#444", marginBottom: 2 }}>
                            Teléfono:{" "}
                            <Text style={{ fontWeight: "bold" }}>
                              {payphoneData.phone || "-"}
                            </Text>
                          </Text>
                        </View>
                      )}
                      <Text
                        style={{
                          color:
                            selectedAccount === "bank" ? "#388e3c" : "#6610f2",
                          fontSize: 13,
                          marginTop: 8,
                          marginBottom: 6,
                          textAlign: "center",
                          fontWeight: "500",
                        }}
                      >
                        {selectedAccount === "bank"
                          ? "La carga de monedas es gratuita."
                          : "Con PayPhone hay un recargo del 5% + IVA."}
                      </Text>
                      <TouchableOpacity
                        style={{
                          alignSelf: "center",
                          backgroundColor:
                            selectedAccount === "bank" ? "#4caf50" : "#6610f2",
                          borderRadius: 8,
                          paddingVertical: 7,
                          paddingHorizontal: 22,
                          marginTop: 2,
                        }}
                        onPress={() => setEditAccount(true)}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontWeight: "bold",
                            fontSize: 15,
                          }}
                        >
                          Editar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
          <View style={containerStyles.waveContainer}>
            <WaveBottomGray
              width={Dimensions.get("window").width}
              height={120}
            />
          </View>
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
