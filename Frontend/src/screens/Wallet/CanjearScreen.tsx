import React, { useState } from "react";
import { Platform } from "react-native";
import { Modal, Pressable, FlatList } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Alert, Image } from "react-native";
// Si tienes lottie-react-native instalado, descomenta la siguiente línea:
// import LottieView from 'lottie-react-native';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../hooks/AuthContext";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { convertBeCoinsToUSD, formatUSDPrice } from "../../constants/currency";
import { WalletBalanceCard } from "./components/WalletBalanceCard";
import { beCoinsService } from "../../services/becoinsService";
import { transactionService } from "../../services/transactionService";

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
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(digitalCurrencies[1].value); // USD por defecto
  const [fromCurrency, setFromCurrency] = useState("becoin");
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const balance =
    useBeCoinsStore((state: { balance: number }) => state.balance) ?? 0;
  const spendBeCoins = useBeCoinsStore((state: any) => state.spendBeCoins);
  const { refetch } = require("./hooks/useWalletData");

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

  const handleBuy = async () => {
    if (!isAmountValid) {
      Alert.alert(
        "Monto inválido",
        "Por favor ingresa un monto válido dentro de tu saldo disponible."
      );
      return;
    }

    if (!user?.id) {
      Alert.alert("Error", "Usuario no autenticado");
      return;
    }

    setIsLoading(true);

    try {
      // Determinar si usar modo demo o producción
      const isDemoMode = process.env.EXPO_PUBLIC_USE_DEMO_MODE === "true";

      console.log("🔧 CanjearScreen configuración:");
      console.log(
        "- process.env.EXPO_PUBLIC_USE_DEMO_MODE:",
        process.env.EXPO_PUBLIC_USE_DEMO_MODE
      );
      console.log(
        "- process.env.EXPO_PUBLIC_API_URL:",
        process.env.EXPO_PUBLIC_API_URL
      );
      console.log("- isDemoMode:", isDemoMode);
      console.log("- user.email:", user.email);
      console.log("- beCoinsService:", !!beCoinsService);

      if (!isDemoMode) {
        try {
          // Modo producción: intentar usar API real
          await beCoinsService.spendBeCoins({
            userId: user.email!,
            amount: parsedAmount,
            description: `Conversión de BECOINS a ${currency.toUpperCase()}`,
            category: "conversion",
            metadata: {
              targetCurrency: currency.toUpperCase(),
              conversionRate: convertBeCoinsToUSD(1),
              targetAmount: convertBeCoinsToUSD(parsedAmount),
            },
          }); // Actualizar store local también
          spendBeCoins(
            parsedAmount,
            `Canje de BECOINS a ${currency === "usd" ? "USD" : "ARS"}`,
            "conversion"
          );
        } catch (apiError: any) {
          console.warn("API no disponible, usando modo demo:", apiError);

          // Si hay error de red, usar modo demo como fallback
          const ok = spendBeCoins(
            parsedAmount,
            `Canje de BECOINS a ${currency === "usd" ? "USD" : "ARS"}`,
            "conversion"
          );

          if (!ok) {
            Alert.alert(
              "Error",
              "No se pudo realizar el canje. Verifica tu saldo."
            );
            return;
          }
        }
      } else {
        // Modo demo: usar store local
        const ok = spendBeCoins(
          parsedAmount,
          `Canje de BECOINS a ${currency === "usd" ? "USD" : "ARS"}`,
          "conversion"
        );

        if (!ok) {
          Alert.alert(
            "Error",
            "No se pudo realizar el canje. Verifica tu saldo."
          );
          return;
        }
      }

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
      // Actualizar el balance global después de canjear
      if (typeof refetch === "function") {
        await refetch();
      }
    } catch (error: any) {
      console.error("Error en canje:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo completar el canje. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <div className="redeem-web-main">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "20px 0 0 0",
            marginBottom: 16,
          }}
        >
          <button
            style={{
              background: "#FFF3E0",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              if (navigation && navigation.goBack) navigation.goBack();
              else window.history.back();
            }}
            aria-label="Volver"
          >
            <span style={{ fontSize: 22, color: "#F88D2A" }}>←</span>
          </button>
          <span
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#1E293B",
            }}
          >
            Canjear BeCoins
          </span>
        </div>
        {/* Tarjeta de saldo */}
        <div className="redeem-web-balance-card">
          {/* Botón volver atrás web */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span className="redeem-web-balance-label">
                Tu saldo disponible
              </span>
              <div className="redeem-web-balance-amount">
                {balance.toLocaleString()} BeCoins
              </div>
              <span className="redeem-web-balance-estimate">
                ≈ ${formatUSDPrice(convertBeCoinsToUSD(balance))} USD
              </span>
            </div>
            <span
              style={{
                background: "#FFF3E0",
                borderRadius: "50%",
                padding: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Icono wallet */}
              <span
                role="img"
                aria-label="wallet"
                style={{ fontSize: 28, color: "#F88D2A" }}
              >
                👛
              </span>
            </span>
          </div>
        </div>

        {/* Tarjeta de formulario */}
        <div className="redeem-web-form-card">
          <span className="redeem-web-section-title">
            ¿Cuánto quieres canjear?
          </span>
          <span className="redeem-web-input-label">Monto en BeCoins</span>
          <div className="redeem-web-input-row">
            <input
              className="redeem-web-amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              type="number"
              maxLength={8}
            />
            <span className="redeem-web-badge">BeCoins</span>
          </div>
          {/* Error */}
          {!isAmountValid && amount !== "" && (
            <div className="redeem-web-error">
              <span role="img" aria-label="alert" style={{ fontSize: 16 }}>
                ⚠️
              </span>
              Monto inválido o insuficiente
            </div>
          )}

          {/* Conversión */}
          <div className="redeem-web-conversion-info">
            <span className="redeem-web-conversion-label">Recibirás</span>
            <div className="redeem-web-conversion-row">
              <span className="redeem-web-conversion-amount">
                {amount && isAmountValid
                  ? formatUSDPrice(convertBeCoinsToUSD(Number(amount)))
                  : "0.00"}
              </span>
              <span className="redeem-web-conversion-currency">
                {currency === "usd" ? "USD" : "ARS"}
              </span>
              <button
                style={{
                  background: "#FFF3E0",
                  border: "none",
                  borderRadius: 8,
                  padding: "4px 12px",
                  color: "#F88D2A",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                onClick={() => setShowCurrencyModal(true)}
              >
                ▼
              </button>
            </div>
            <span className="redeem-web-conversion-note">
              Conversión aproximada • Tasa: 1 BeCoin = ${convertBeCoinsToUSD(1)}{" "}
              USD
            </span>
          </div>

          {showCurrencyModal && (
            <div
              className="redeem-web-modal-overlay"
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                className="redeem-web-modal-content"
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 24,
                  minWidth: 280,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                }}
              >
                <div
                  className="redeem-web-modal-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    Seleccionar moneda
                  </span>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 22,
                      cursor: "pointer",
                    }}
                    onClick={() => setShowCurrencyModal(false)}
                  >
                    ✕
                  </button>
                </div>
                {digitalCurrencies.slice(1).map((item) => (
                  <div
                    key={item.value}
                    className={`redeem-web-modal-option${
                      currency === item.value ? " selected" : ""
                    }`}
                    style={{
                      padding: "12px 0",
                      cursor: "pointer",
                      fontWeight: currency === item.value ? 700 : 500,
                      color: currency === item.value ? "#F88D2A" : "#1E293B",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                    onClick={() => {
                      setCurrency(item.value);
                      setShowCurrencyModal(false);
                    }}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Botón de canje */}
          <button
            className={`redeem-web-btn${
              !isAmountValid || isLoading ? " disabled" : ""
            }`}
            onClick={handleBuy}
            disabled={!isAmountValid || isLoading}
          >
            {isLoading ? "Procesando..." : "Canjear BeCoins"}
          </button>
        </div>

        {/* Información adicional */}
        <div className="redeem-web-info-card">
          <div className="redeem-web-info-title">
            <span
              role="img"
              aria-label="info"
              style={{ fontSize: 20, color: "#6B7280" }}
            >
              ℹ️
            </span>
            Información del canje
          </div>
          <div className="redeem-web-info-text">
            • El canje se realiza al tipo de cambio actual
            <br />
            • Los fondos estarán disponibles inmediatamente
            <br />
            • No se aplican comisiones adicionales
            <br />• Monto mínimo: 1 BeCoin
          </div>
        </div>
      </div>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header profesional */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Canjear BeCoins</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceContent}>
              <Text style={styles.balanceLabel}>Tu saldo disponible</Text>
              <Text style={styles.balanceAmount}>
                {balance.toLocaleString()} BeCoins
              </Text>
              <Text style={styles.balanceEstimate}>
                ≈ ${formatUSDPrice(convertBeCoinsToUSD(balance))} USD
              </Text>
            </View>
            <View style={styles.balanceIcon}>
              <MaterialCommunityIcons name="wallet" size={32} color="#F88D2A" />
            </View>
          </View>
        </View>

        {/* Formulario de canje */}
        <View style={styles.formSection}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>¿Cuánto quieres canjear?</Text>

            {/* Input de monto */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Monto en BeCoins</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={[
                    styles.amountInput,
                    !isAmountValid && amount ? styles.inputError : {},
                  ]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={8}
                />
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>BeCoins</Text>
                </View>
              </View>

              {!isAmountValid && amount !== "" && (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={16}
                    color="#EF4444"
                  />
                  <Text style={styles.errorText}>
                    Monto inválido o insuficiente
                  </Text>
                </View>
              )}
            </View>

            {/* Conversión */}
            <View style={styles.conversionSection}>
              <View style={styles.conversionHeader}>
                <Text style={styles.inputLabel}>Recibirás</Text>
                <TouchableOpacity
                  style={styles.currencySelector}
                  onPress={() => setShowCurrencyModal(true)}
                >
                  <Text style={styles.currencySelectorText}>
                    {currency === "usd" ? "USD" : "ARS"}
                  </Text>
                  <Ionicons name="chevron-down" size={16} color="#F88D2A" />
                </TouchableOpacity>
              </View>

              <View style={styles.conversionResult}>
                <Text style={styles.conversionAmount}>
                  {amount && isAmountValid
                    ? `${formatUSDPrice(convertBeCoinsToUSD(Number(amount)))}`
                    : "0.00"}
                </Text>
                <Text style={styles.conversionCurrency}>
                  {currency === "usd" ? "USD" : "ARS"}
                </Text>
              </View>

              <Text style={styles.conversionNote}>
                Conversión aproximada • Tasa: 1 BeCoin = $
                {convertBeCoinsToUSD(1)} USD
              </Text>
            </View>

            {/* Botón de canje */}
            <TouchableOpacity
              style={[
                styles.exchangeButton,
                (!isAmountValid || isLoading) && styles.exchangeButtonDisabled,
              ]}
              onPress={handleBuy}
              disabled={!isAmountValid || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <MaterialCommunityIcons
                    name="loading"
                    size={20}
                    color="#FFFFFF"
                  />
                  <Text style={styles.exchangeButtonText}>Procesando...</Text>
                </View>
              ) : (
                <Text style={styles.exchangeButtonText}>Canjear BeCoins</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#6B7280"
              />
              <Text style={styles.infoTitle}>Información del canje</Text>
            </View>
            <Text style={styles.infoText}>
              • El canje se realiza al tipo de cambio actual{"\n"}• Los fondos
              estarán disponibles inmediatamente{"\n"}• No se aplican comisiones
              adicionales{"\n"}• Monto mínimo: 1 BeCoin
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal de selección de moneda */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar moneda</Text>
              <TouchableOpacity
                onPress={() => setShowCurrencyModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {digitalCurrencies.slice(1).map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.currencyOption,
                  currency === item.value && styles.currencyOptionSelected,
                ]}
                onPress={() => {
                  setCurrency(item.value);
                  setShowCurrencyModal(false);
                }}
              >
                <View style={styles.currencyOptionContent}>
                  <Text
                    style={[
                      styles.currencyOptionText,
                      currency === item.value &&
                        styles.currencyOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.currencyOptionCode}>
                    {item.value.toUpperCase()}
                  </Text>
                </View>
                {currency === item.value && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#F88D2A"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de éxito */}
      {showSuccess && successData && (
        <Modal visible={showSuccess} transparent animationType="fade">
          <View style={styles.successModalOverlay}>
            <View style={styles.successModalContent}>
              <View style={styles.successIcon}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={60}
                  color="#6BA43A"
                />
              </View>

              <Text style={styles.successTitle}>¡Canje exitoso!</Text>
              <Text style={styles.successDescription}>
                Has canjeado {successData.amount} BeCoins por{" "}
                <Text style={styles.successAmount}>{successData.usdValue}</Text>
              </Text>

              <View style={styles.successDetails}>
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Operación:</Text>
                  <Text style={styles.successDetailValue}>
                    {successData.opNumber}
                  </Text>
                </View>
                <View style={styles.successDetailRow}>
                  <Text style={styles.successDetailLabel}>Fecha:</Text>
                  <Text style={styles.successDetailValue}>
                    {successData.date}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setShowSuccess(false);
                  setSuccessData(null);
                  navigation.goBack();
                }}
              >
                <Text style={styles.successButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Contenedor principal
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "android" ? 16 : 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F88D2A",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll container
  scrollContainer: {
    flex: 1,
  },

  // Balance section
  balanceSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  balanceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  balanceContent: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 2,
  },
  balanceEstimate: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  balanceIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },

  // Form section
  formSection: {
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 24,
    textAlign: "center",
  },

  // Input group
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#FAFAFA",
    color: "#1E293B",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  currencyBadge: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#F88D2A",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F88D2A",
  },

  // Error container
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },

  // Conversion section
  conversionSection: {
    marginBottom: 24,
  },
  conversionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F88D2A",
    gap: 4,
  },
  currencySelectorText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F88D2A",
  },
  conversionResult: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
    gap: 8,
  },
  conversionAmount: {
    fontSize: 32,
    fontWeight: "700",
    color: "#F88D2A",
  },
  conversionCurrency: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
  },
  conversionNote: {
    fontSize: 12,
    color: "#64748B",
    fontStyle: "italic",
  },

  // Exchange button
  exchangeButton: {
    height: 56,
    backgroundColor: "#F88D2A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exchangeButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  exchangeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Info section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },

  // Modal overlay and content
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },

  // Currency options
  currencyOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F8F9FA",
  },
  currencyOptionSelected: {
    backgroundColor: "#FFF7ED",
  },
  currencyOptionContent: {
    flex: 1,
  },
  currencyOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 2,
  },
  currencyOptionTextSelected: {
    color: "#F88D2A",
  },
  currencyOptionCode: {
    fontSize: 14,
    color: "#64748B",
  },

  // Success modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 32,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  successDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  successAmount: {
    color: "#6BA43A",
    fontWeight: "700",
  },
  successDetails: {
    width: "100%",
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  successDetailLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  successDetailValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  successButton: {
    width: "100%",
    height: 48,
    backgroundColor: "#F88D2A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Legacy styles (mantener por compatibilidad)
  screen: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flex: 1,
  },
  balanceCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: "600",
    backgroundColor: "#F9FAFB",
    color: "#1F2937",
  },
  currencyLabel: {
    backgroundColor: "#FED7AA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#F88D2A",
    minWidth: 120,
  },
  currencyLabelText: {
    fontSize: 16,
    color: "#F88D2A",
    fontWeight: "bold",
    textAlign: "center",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F88D2A",
    marginBottom: 4,
  },
  resultDescription: {
    color: "#6B7280",
    fontSize: 14,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalOptionText: {
    fontSize: 17,
    color: "#1F2937",
  },
  modalOptionSubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
});
export default CanjearScreen;
