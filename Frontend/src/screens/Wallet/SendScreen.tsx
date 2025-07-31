import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { WalletBalanceCard } from "../Wallet/components/WalletBalanceCard";
import { useWalletData } from "../Wallet/hooks/useWalletData";

const digitalCurrencies = [
  { label: "BECOINS", value: "becoin" },
  { label: "USD", value: "usd" },
  { label: "ARS", value: "ars" },
];

const SendScreen = ({ navigation }: any) => {
  const { walletData } = useWalletData();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState(digitalCurrencies[0].value);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [sentAmount, setSentAmount] = useState("");
  const [sentCurrency, setSentCurrency] = useState("");
  const [sentAddress, setSentAddress] = useState("");

  const handleSend = () => {
    setSentAmount(amount);
    setSentCurrency(currency);
    setSentAddress(address);
    setShowSuccess(true);
    setAmount("");
    setAddress("");
  };

  return (
    <View style={styles.container}>
      {/* Modal de éxito visual */}
      {showSuccess && (
        <View
          style={{
            position: "absolute",
            zIndex: 100,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 24,
              padding: 28,
              width: 320,
              alignItems: "center",
              elevation: 8,
            }}
          >
            {/* Icono visual de éxito */}
            <MaterialCommunityIcons
              name="check-decagram"
              size={64}
              color="#4ecdc4"
              style={{ marginBottom: 8 }}
            />
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: "#4ecdc4",
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              ¡Transferencia enviada!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#222",
                marginBottom: 2,
                textAlign: "center",
              }}
            >
              Se le informó al usuario por WhatsApp
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#888",
                marginBottom: 8,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              Monto enviado:
              <Text style={{ color: "#f55b5b", fontWeight: "bold" }}>
                {sentAmount
                  ? ` ${sentAmount} ${
                      sentCurrency === "becoin"
                        ? "BECOINS"
                        : sentCurrency.toUpperCase()
                    }`
                  : " ..."}
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: "#888",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Destinatario:
              <Text style={{ color: "#222", fontWeight: "bold" }}>
                {sentAddress ? ` ${sentAddress}` : " ..."}
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              El destinatario recibirá una notificación y podrá ver la
              transacción en su historial.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#f55b5b",
                borderRadius: 16,
                paddingVertical: 10,
                paddingHorizontal: 32,
                marginTop: 6,
                shadowColor: "#f55b5b",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Header y saldo */}
      <WalletBalanceCard
        walletData={walletData}
        backgroundColor="#EB5D4F"
        accentColor="#fff"
      />
      <Text style={styles.label}>Enviar</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Ingresar monto"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity
          style={styles.select}
          onPress={() => setShowCurrencyModal(true)}
        >
          <Text
            style={[
              styles.selectText,
              { color: "#f55b5b", fontWeight: "bold", letterSpacing: 1 },
            ]}
          >
            {" "}
            {currency === "becoin" ? "BECOINS" : currency.toUpperCase()}{" "}
            <Ionicons name="chevron-down" size={16} color="#f55b5b" />{" "}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Modal selector de moneda */}
      {showCurrencyModal && (
        <View
          style={{
            position: "absolute",
            zIndex: 100,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.18)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              paddingVertical: 12,
              width: 260,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 18,
                color: "#222",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Selecciona moneda
            </Text>
            {digitalCurrencies.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => {
                  setCurrency(item.value);
                  setShowCurrencyModal(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  backgroundColor: currency === item.value ? "#f55b5b" : "#fff",
                  borderRadius: 12,
                  marginBottom: 6,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    color: "#222",
                    fontWeight: currency === item.value ? "bold" : "normal",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      <Text style={styles.label}>Alias o teléfono</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.inputFull}
          placeholder="Ingresar alias o número de teléfono"
          value={address}
          onChangeText={setAddress}
          keyboardType="default"
        />
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate("QR")}
        >
          <Ionicons name="qr-code-outline" size={28} color="#f55b5b" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.sendButton, { opacity: amount && address ? 1 : 0.5 }]}
        disabled={!amount || !address}
        onPress={handleSend}
      >
        <Text style={styles.sendButtonText}>ENVIAR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf1f8", padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16, color: "#222" },
  label: { fontSize: 16, color: "#555", marginTop: 12 },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  select: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: "#f55b5b",
    minWidth: 90,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginLeft: 2,
  },
  selectText: { fontSize: 16, color: "#222", fontWeight: "bold" },
  inputFull: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  qrButton: {
    marginLeft: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f55b5b",
    shadowColor: "#f55b5b",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  sendButton: {
    backgroundColor: "#f55b5b",
    borderRadius: 12,
    padding: 18,
    marginTop: 24,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default SendScreen;
