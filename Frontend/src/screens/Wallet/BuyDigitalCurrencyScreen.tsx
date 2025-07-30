import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { convertBeCoinsToUSD, formatUSDPrice } from "../../constants/currency";

const digitalCurrencies = [
  { label: "BECOINS", value: "becoin" },
  { label: "USDT", value: "usdt" },
  { label: "USD Coin", value: "usdc" },
  { label: "Binance USD", value: "busd" },
  { label: "TrueUSD", value: "tusd" },
  { label: "Dai", value: "dai" },
];
const avatar = require("../../../assets/icon.png");

export const BuyDigitalCurrencyScreen: React.FC<{
  navigation: any;
  route?: any;
  balance?: number;
}> = ({ navigation, route, balance: propBalance }) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(digitalCurrencies[3].value); // TrueUSD por defecto
  const [fromCurrency, setFromCurrency] = useState("becoin");
  // Obtener el balance real desde la store Zustand
  const balance =
    useBeCoinsStore((state: { balance: number }) => state.balance) ?? 0;

  const handleBuy = () => {
    // Aquí iría la lógica de compra
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      {/* Header y wave decorativo */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={{ fontSize: 22, color: "#222" }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar</Text>
      </View>
      {/* Card amarilla con balance y avatar */}
      <View style={styles.balanceCard}>
        <Image source={avatar} style={styles.avatar} />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.balanceLabel}>Disponible:</Text>
          <Text style={styles.balanceAmount}>{balance}</Text>
          <Text style={styles.balanceSub}>
            Total estimado: $ {formatUSDPrice(convertBeCoinsToUSD(balance))}
          </Text>
        </View>
      </View>
      {/* Formulario de cambio */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Cambiar Crypto</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cambiar desde</Text>
            <View style={styles.inputSelectRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 6 }]}
                value={amount}
                onChangeText={setAmount}
                placeholder={`Ingresar monto (${fromCurrency.toUpperCase()})`}
                keyboardType="numeric"
              />
              <View
                style={{
                  flex: 1,
                  position: "relative",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: fromCurrency ? "#222" : "#A0A0A0",
                    fontWeight: fromCurrency ? "600" : "400",
                    paddingVertical: 8,
                    paddingLeft: 12,
                    backgroundColor: "#f6f6f6",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                  }}
                >
                  {digitalCurrencies.find((c) => c.value === fromCurrency)
                    ?.label || "Selecciona moneda"}
                </Text>
                <Picker
                  selectedValue={fromCurrency}
                  onValueChange={setFromCurrency}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                  }}
                >
                  {digitalCurrencies.map((c) => (
                    <Picker.Item
                      key={c.value}
                      label={c.label}
                      value={c.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cambiar a</Text>
            <View style={styles.inputSelectRow}>
              <Text style={styles.inputResult}>
                {amount ? (parseFloat(amount) * 1).toFixed(2) : "0.00"}{" "}
                {fromCurrency.toUpperCase()} = ${" "}
                {amount
                  ? formatUSDPrice(convertBeCoinsToUSD(Number(amount)))
                  : "0.00"}
              </Text>
              <View
                style={{
                  flex: 1,
                  position: "relative",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: currency ? "#222" : "#A0A0A0",
                    fontWeight: currency ? "600" : "400",
                    paddingVertical: 8,
                    paddingLeft: 12,
                    backgroundColor: "#f6f6f6",
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                  }}
                >
                  {digitalCurrencies.find((c) => c.value === currency)?.label ||
                    "Selecciona moneda"}
                </Text>
                <Picker
                  selectedValue={currency}
                  onValueChange={setCurrency}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0,
                  }}
                >
                  {digitalCurrencies.map((c) => (
                    <Picker.Item
                      key={c.value}
                      label={c.label}
                      value={c.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
          <Text style={styles.buyBtnText}>CAMBIAR</Text>
        </TouchableOpacity>
      </View>
      {/* Wave decorativo */}
      <View style={styles.waveContainer}>
        {/* <WaveBottomGray width={360} height={80} /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6f8fa",
    position: "relative",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },
  balanceCard: {
    backgroundColor: "#ffe066",
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: "#222",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f9a825",
    marginTop: 2,
  },
  balanceSub: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 20,
    marginHorizontal: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    marginBottom: 6,
  },
  inputSelectRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
    flex: 1,
    marginRight: 8,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    backgroundColor: "#f6f6f6",
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 110,
    justifyContent: "center",
  },
  picker: {
    height: 36,
    width: 110,
  },
  inputResult: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
    marginRight: 8,
  },
  buyBtn: {
    backgroundColor: "#ffe066",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  buyBtnText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 17,
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#eee",
    borderRadius: 12,
    marginBottom: 6,
  },
  qrText: {
    fontSize: 14,
    color: "#888",
    marginTop: 6,
  },
  waveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
});
