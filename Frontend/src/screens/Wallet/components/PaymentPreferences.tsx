import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { PaymentAccountForm } from "./PaymentAccountForm";

type PaymentAccountType = "payphone" | "bank" | null;

interface PaymentPreferencesProps {
  selectedAccount: PaymentAccountType;
  setSelectedAccount: (type: PaymentAccountType) => void;
  payphoneLogo: any;
  styles: any;
  payphoneData: { phone: string };
  setPayphoneData: (data: { phone: string }) => void;
  bankData: {
    holder: string;
    idNumber: string;
    bank: string;
    accountNumber: string;
  };
  setBankData: (data: {
    holder: string;
    idNumber: string;
    bank: string;
    accountNumber: string;
  }) => void;
  onAddExternalAccount?: () => void;
}

export const PaymentPreferences: React.FC<PaymentPreferencesProps> = ({
  selectedAccount,
  setSelectedAccount,
  payphoneLogo,
  styles,
  payphoneData,
  setPayphoneData,
  bankData,
  setBankData,
  onAddExternalAccount,
}) => {
  const [showModal, setShowModal] = useState(false);

  // Handler para cards: selecciona o deselecciona
  const handleSelect = (type: PaymentAccountType) => {
    if (selectedAccount === type) {
      setSelectedAccount(null);
    } else {
      setSelectedAccount(type);
    }
  };

  // Modal global para sobresalir de todo
  const Modal = () =>
    showModal ? (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.18)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
        pointerEvents="box-none"
      >
        <View
          style={{
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
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 16 }}>
            Próximamente podrás agregar otras preferencias de pago
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 10,
              padding: 8,
              borderRadius: 8,
              backgroundColor: "#f3f3f3",
            }}
            onPress={() => setShowModal(false)}
          >
            <Text style={{ color: "#F88D2A", fontWeight: "bold" }}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : null;

  return (
    <>
      <Modal />
      <View style={styles.paymentPrefCard}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            justifyContent: "space-between",
          }}
        >
          <Text style={styles.paymentPrefTitle}>Preferencias de pago</Text>
          <TouchableOpacity
            style={[styles.addBtn, { marginLeft: 10 }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 8 }}
        >
          {/* Card Payphone */}
          <TouchableOpacity
            style={[
              styles.selectedAccountBox,
              {
                borderColor:
                  selectedAccount === "payphone" ? "#F88D2A" : "#e0e0e0",
                borderWidth: 1.5,
                marginRight: 12,
                minWidth: 180,
                maxWidth: 220,
                backgroundColor:
                  selectedAccount === "payphone" ? "#f3f0ff" : "#fff",
              },
            ]}
            onPress={() => handleSelect("payphone")}
            activeOpacity={0.9}
          >
            <Image source={payphoneLogo} style={styles.accountLogo} />
            <Text style={[styles.accountText, { fontWeight: "bold" }]}>
              Payphone
            </Text>
          </TouchableOpacity>
          {/* Card Bancaria */}
          <TouchableOpacity
            style={[
              styles.selectedAccountBox,
              {
                borderColor: selectedAccount === "bank" ? "#4caf50" : "#e0e0e0",
                borderWidth: 1.5,
                minWidth: 180,
                maxWidth: 220,
                backgroundColor:
                  selectedAccount === "bank" ? "#e8f5e9" : "#fff",
              },
            ]}
            onPress={() => handleSelect("bank")}
            activeOpacity={0.9}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>🏦</Text>
            <Text style={[styles.accountText, { fontWeight: "bold" }]}>
              Cuenta bancaria
            </Text>
          </TouchableOpacity>
        </ScrollView>
        {/* Formulario solo si hay una seleccion */}
        {selectedAccount && (
          <View style={{ marginTop: 18 }}>
            <PaymentAccountForm
              type={selectedAccount}
              value={selectedAccount === "payphone" ? payphoneData : bankData}
              onChange={(data) => {
                if (selectedAccount === "payphone") {
                  setPayphoneData(data as { phone: string });
                } else if (selectedAccount === "bank") {
                  setBankData(
                    data as {
                      holder: string;
                      idNumber: string;
                      bank: string;
                      accountNumber: string;
                    }
                  );
                }
              }}
            />
          </View>
        )}
      </View>
    </>
  );
};
