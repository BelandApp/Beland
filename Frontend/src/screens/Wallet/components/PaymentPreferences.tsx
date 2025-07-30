import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Modal,
  Image,
} from "react-native";

export type PaymentAccountType = "payphone" | "bank" | null;

interface PaymentPreferencesProps {
  showAccountModal: boolean;
  setShowAccountModal: (show: boolean) => void;
  selectedAccount: PaymentAccountType;
  setSelectedAccount: (type: PaymentAccountType) => void;
  payphoneLogo: any;
  styles: any;
}

export const PaymentPreferences: React.FC<PaymentPreferencesProps> = ({
  showAccountModal,
  setShowAccountModal,
  selectedAccount,
  setSelectedAccount,
  payphoneLogo,
  styles,
}) => (
  <>
    {/* Modal para elegir tipo de cuenta */}
    <Modal
      visible={showAccountModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowAccountModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={[styles.modalTitle, { marginBottom: 24 }]}>
            Añadir método de pago
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.accountOption,
              {
                borderWidth: 1.5,
                borderColor:
                  selectedAccount === "payphone" ? "#6610f2" : "#e0e0e0",
                backgroundColor: pressed ? "#f3f0ff" : "#fff",
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 1,
              },
            ]}
            onPress={() => {
              setSelectedAccount("payphone");
              setShowAccountModal(false);
            }}
          >
            <Image
              source={payphoneLogo}
              style={[
                styles.accountLogo,
                {
                  borderRadius: 8,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#eee",
                },
              ]}
            />
            <Text
              style={[
                styles.accountText,
                {
                  fontWeight: selectedAccount === "payphone" ? "bold" : "500",
                  fontSize: 16,
                  color: selectedAccount === "payphone" ? "#6610f2" : "#222",
                },
              ]}
            >
              Cuenta de Payphone
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.accountOption,
              {
                borderWidth: 1.5,
                borderColor: selectedAccount === "bank" ? "#4caf50" : "#e0e0e0",
                backgroundColor: pressed ? "#eafbe7" : "#fff",
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 1,
                flexDirection: "row",
                alignItems: "center",
              },
            ]}
            onPress={() => {
              setSelectedAccount("bank");
              setShowAccountModal(false);
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 10 }}>🏦</Text>
            <Text
              style={[
                styles.accountText,
                {
                  fontWeight: selectedAccount === "bank" ? "bold" : "500",
                  fontSize: 16,
                  color: selectedAccount === "bank" ? "#4caf50" : "#222",
                },
              ]}
            >
              Cuenta Bancaria
            </Text>
          </Pressable>
          <TouchableOpacity
            style={[
              styles.closeModalBtn,
              {
                marginTop: 18,
                backgroundColor: "#f8f8f8",
                borderWidth: 1,
                borderColor: "#eee",
              },
            ]}
            onPress={() => setShowAccountModal(false)}
          >
            <Text
              style={{ color: "#6610f2", fontWeight: "bold", fontSize: 16 }}
            >
              Cerrar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {/* Preferencias de pago */}
    <View style={styles.paymentPrefCard}>
      <View style={styles.paymentPrefHeader}>
        <Text style={styles.paymentPrefTitle}>Preferencias de pago</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAccountModal(true)}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {/* Mostrar cuenta seleccionada */}
      {selectedAccount === null && (
        <Text style={styles.noAccountText}>
          Aún no tenés métodos de pago cargados
        </Text>
      )}
      {selectedAccount === "payphone" && (
        <View style={styles.selectedAccountBox}>
          <Image source={payphoneLogo} style={styles.accountLogo} />
          <Text style={styles.accountText}>Cuenta de Payphone</Text>
        </View>
      )}
      {selectedAccount === "bank" && (
        <View style={styles.selectedAccountBox}>
          <Text style={{ fontSize: 24, marginRight: 10 }}>🏦</Text>
          <Text style={styles.accountText}>Cuenta Bancaria</Text>
        </View>
      )}
    </View>
  </>
);
