import React, { useState } from "react";
import { Platform } from "react-native";
import { Modal, Pressable, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Alert, Image } from "react-native";
// Si tienes lottie-react-native instalado, descomenta la siguiente línea:
// import LottieView from 'lottie-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { convertBeCoinsToUSD, formatUSDPrice } from "../../constants/currency";
import { WalletBalanceCard } from "./components/WalletBalanceCard";

// Solo permitir canje de BECOINS a USD o ARS
const digitalCurrencies = [
  { label: "BECOINS", value: "becoin" },
  { label: "Dólar estadounidense (USD)", value: "usd" },
  { label: "Peso argentino (ARS)", value: "ars" },
];

const CanjearScreen: React.FC<{
  navigation: any;
  route?: any;
  balance?: number;
}> = ({ navigation, route, balance: propBalance }) => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(digitalCurrencies[1].value); // USD por defecto
  const [fromCurrency, setFromCurrency] = useState("becoin");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const balance =
    useBeCoinsStore((state: { balance: number }) => state.balance) ?? 0;
  const spendBeCoins = useBeCoinsStore((state: any) => state.spendBeCoins);

  // Estado para modal de éxito
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    amount: number;
    currency: string;
    usdValue: string;
    opNumber: string;
    date: string;
  } | null>(null);

  const parsedAmount = parseFloat(amount) || 0;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= balance;

  const handleBuy = () => {
    if (!isAmountValid) {
      Alert.alert(
        "Monto inválido",
        "Por favor ingresa un monto válido dentro de tu saldo disponible."
      );
      return;
    }
    // Descontar saldo usando la store
    const ok = spendBeCoins(
      parsedAmount,
      `Canje de BECOINS a ${currency === "usd" ? "USD" : "ARS"}`,
      "catalog"
    );
    if (ok) {
      // Mostrar modal de éxito visual
      const now = new Date();
      setSuccessData({
        amount: parsedAmount,
        currency: currency.toUpperCase(),
        usdValue: `${formatUSDPrice(
          convertBeCoinsToUSD(parsedAmount)
        )} ${currency.toUpperCase()}`,
        opNumber: Math.floor(
          Math.random() * 900000000000 + 100000000000
        ).toString(),
        date: `${now.getDate().toString().padStart(2, "0")}/${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${now.getFullYear()} a las ${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")} hs`,
      });
      setShowSuccess(true);
      setAmount("");
    } else {
      Alert.alert("Error", "No se pudo realizar el canje. Verifica tu saldo.");
    }
  };

  return (
    <View style={[styles.screen, { padding: 16 }]}>
      {/* Modal de éxito visual */}
      {showSuccess && successData && (
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
            {/* Animación de confeti */}
            {/* Si tienes lottie-react-native, reemplaza el emoji por LottieView */}
            <Text style={{ fontSize: 54, marginBottom: 8 }}>🎉</Text>
            {/* <LottieView source={require('../../../assets/confetti.json')} autoPlay loop={false} style={{ width: 90, height: 90, marginBottom: 8 }} /> */}
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#4ecdc4",
                marginBottom: 6,
                textAlign: "center",
              }}
            >
              ¡Ya tenés tus {successData.currency}!
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "#4caf50",
                fontWeight: "bold",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Transacción aprobada
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#222",
                marginBottom: 2,
                textAlign: "center",
              }}
            >
              Cambiaste{" "}
              <Text style={{ fontWeight: "bold" }}>
                {successData.amount} Becoins
              </Text>{" "}
              por{" "}
              <Text style={{ color: "#43a047", fontWeight: "bold" }}>
                + {successData.usdValue}
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 2,
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Realizada el {successData.date}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#4ecdc4",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Número de operación{" "}
              <Text style={{ fontWeight: "bold", color: "#43a047" }}>
                {successData.opNumber}
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
              Los {successData.currency} estarán disponibles en tu cuenta para
              que puedas realizar transacciones con ellos.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#4ecdc4",
                borderRadius: 16,
                paddingVertical: 10,
                paddingHorizontal: 32,
                marginTop: 6,
                shadowColor: "#4ecdc4",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => {
                setShowSuccess(false);
                setSuccessData(null);
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
      {/* Card amarilla con balance y avatar */}
      <WalletBalanceCard
        walletData={{
          balance: balance,
          estimatedValue: formatUSDPrice(convertBeCoinsToUSD(balance)),
        }}
        backgroundColor="#ffe066"
        accentColor="#f9a825"
        hideEstimated={false}
      />
      {/* Formulario de cambio */}
      <View
        style={[
          styles.formCard,
          {
            paddingVertical: 28,
            paddingHorizontal: 20,
            borderRadius: 22,
            marginTop: 10,
          },
        ]}
      >
        {/* Campo monto */}
        <Text style={[styles.formTitle, { fontSize: 19, marginBottom: 18 }]}>
          ¿Cuánto quieres canjear?
        </Text>
        <View style={[styles.inputRow, { marginBottom: 10 }]}>
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: "#888",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                },
              ]}
            >
              Monto (BECOINS)
            </Text>
            <View style={styles.inputSelectRow}>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    marginRight: 8,
                    backgroundColor: "#f9fafb",
                    borderColor:
                      isAmountValid || !amount ? "#e0e4ea" : "#ff7675",
                    fontWeight: "bold",
                    fontSize: 20,
                    paddingVertical: 12,
                  },
                ]}
                value={amount}
                onChangeText={setAmount}
                placeholder="Ej: 100"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                maxLength={8}
              />
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: 18,
                    color: "#f9a825",
                    fontWeight: "bold",
                    paddingVertical: 12,

                    backgroundColor: "#fffbe6",
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#ffe066",
                    textAlign: "center",
                  }}
                >
                  BECOINS
                </Text>
              </View>
            </View>
            {/* Mensaje de error si el monto es inválido */}
            {!isAmountValid && amount !== "" && (
              <Text style={{ color: "#ff7675", fontSize: 13, marginTop: 2 }}>
                Monto inválido o insuficiente.
              </Text>
            )}
          </View>
        </View>
        {/* Campo moneda destino */}
        <View style={[styles.inputRow, { marginBottom: 10 }]}>
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.inputLabel,
                {
                  color: "#888",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginBottom: 8,
                },
              ]}
            >
              Recibirás
            </Text>
            <View style={[styles.inputSelectRow, { alignItems: "flex-end" }]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "bold",
                    color: "#f9a825",
                    marginBottom: 2,
                    textAlign: "left",
                  }}
                >
                  {amount && isAmountValid
                    ? `${formatUSDPrice(convertBeCoinsToUSD(Number(amount)))} ${
                        currency === "usd" ? "USD" : "ARS"
                      }`
                    : `0.00 ${currency === "usd" ? "USD" : "ARS"}`}
                </Text>
                <Text style={{ color: "#888", fontSize: 13, marginTop: 0 }}>
                  Al canjear {amount && isAmountValid ? amount : 0} BECOINS
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Pressable
                  onPress={() => setShowCurrencyModal(true)}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? "#fffde7" : "#fffbe6",
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: pressed ? "#ffe066" : "#f9a825",
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 38,
                    minWidth: 120,
                    shadowColor: "#ffe066",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: pressed ? 4 : 2,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#f9a825",
                      fontWeight: "bold",
                      textAlign: "center",
                      flexShrink: 1,
                      flexGrow: 1,
                      letterSpacing: 1,
                    }}
                    numberOfLines={1}
                  >
                    {currency === "usd"
                      ? "USD"
                      : currency === "ars"
                      ? "ARS"
                      : "Moneda"}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="#f9a825"
                    style={{ marginLeft: 4 }}
                  />
                </Pressable>
                {/* Modal de selección de moneda */}
                <Modal
                  visible={showCurrencyModal}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setShowCurrencyModal(false)}
                >
                  <Pressable
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(0,0,0,0.18)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                    onPress={() => setShowCurrencyModal(false)}
                  >
                    <View
                      style={{
                        backgroundColor: "#fff",
                        borderRadius: 18,
                        paddingVertical: 12,
                        width: 300,
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
                      <FlatList
                        data={digitalCurrencies.slice(1)}
                        keyExtractor={(item) => item.value}
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => {
                              setCurrency(item.value);
                              setShowCurrencyModal(false);
                            }}
                            style={({ pressed }) => ({
                              paddingVertical: 16,
                              paddingHorizontal: 18,
                              backgroundColor:
                                currency === item.value
                                  ? "#ffe066"
                                  : pressed
                                  ? "#f6f6f6"
                                  : "#fff",
                              borderRadius: 12,
                              marginBottom: 6,
                            })}
                          >
                            <Text
                              style={{
                                fontSize: 17,
                                color: "#222",
                                fontWeight:
                                  currency === item.value ? "bold" : "normal",
                              }}
                            >
                              {item.label}
                            </Text>
                            <Text
                              style={{
                                fontSize: 13,
                                color: "#888",
                                marginTop: 2,
                              }}
                            >
                              {item.value.toUpperCase()}
                            </Text>
                          </Pressable>
                        )}
                        ItemSeparatorComponent={() => (
                          <View style={{ height: 2 }} />
                        )}
                      />
                    </View>
                  </Pressable>
                </Modal>
              </View>
            </View>
          </View>
        </View>
        {/* Botón canjear */}
        <TouchableOpacity
          style={[
            styles.buyBtn,
            {
              backgroundColor: isAmountValid ? "#ffe066" : "#f6e9b2",
              borderRadius: 16,
              marginTop: 18,
              shadowColor: "#ffe066",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.18,
              shadowRadius: 12,
              elevation: 4,
            },
          ]}
          onPress={handleBuy}
          disabled={!isAmountValid}
        >
          <Text
            style={[
              styles.buyBtnText,
              {
                color: isAmountValid ? "#222" : "#bbb",
                fontSize: 19,
                letterSpacing: 1,
              },
            ]}
          >
            CANJEAR
          </Text>
        </TouchableOpacity>
      </View>
      {/* Wave decorativo */}
      <View style={styles.waveContainer}>
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 70,
            backgroundColor: "#eaf1f8",
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            zIndex: -1,
          }}
        />
        <Image
          source={require("../../../assets/splash-icon.png")}
          style={{
            width: 120,
            height: 60,
            alignSelf: "center",
            opacity: 0.18,
            marginBottom: 8,
          }}
        />
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
  headerDecor: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 38,
    paddingHorizontal: 18,
    marginBottom: 2,
    backgroundColor: "#fffbe6",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#ffe066",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
export default CanjearScreen;
