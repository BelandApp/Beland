import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Montos predefinidos
const PRESET_AMOUNTS = [10, 25, 50, 100, 200, 500];
const PAYMENT_METHODS = [
  { id: "PAYPHONE", name: "Payphone", icon: "cellphone" },
  { id: "BANK_TRANSFER", name: "Transferencia Bancaria", icon: "bank" },
];

// Función para cargar el script Payphone en web
function loadPayphoneScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Cargar CSS solo una vez
    if (!document.getElementById("payphone-css")) {
      const link = document.createElement("link");
      link.id = "payphone-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
      document.head.appendChild(link);
    }
    // Cargar JS solo una vez
    // @ts-ignore
    if (window.PPaymentButtonBox) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el script de Payphone."));
    document.body.appendChild(script);
  });
}

export default function RechargeScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- RENDER WEB ---
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          background: "#f0f9ff",
          minHeight: "100vh",
          padding: 0,
          fontFamily: "'Inter', 'Roboto', 'Segoe UI', sans-serif",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            margin: "40px auto",
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: 32,
          }}
        >
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              border: "2px solid #F88D2A",
              color: "#F88D2A",
              fontWeight: 600,
              fontSize: 16,
              borderRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
              marginBottom: 24,
              boxShadow: "0 2px 8px rgba(248,141,42,0.08)",
              transition: "all 0.2s",
            }}
            onClick={() => window.history.back()}
          >
            ← Volver
          </button>
          <div
            style={{ display: "flex", alignItems: "center", marginBottom: 32 }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#F88D2A",
                letterSpacing: 1,
              }}
            >
              Recargar BeCoins
            </span>
          </div>
          <div style={{ marginBottom: 24 }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F88D2A",
                marginBottom: 12,
                display: "block",
              }}
            >
              Montos rápidos
            </span>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {PRESET_AMOUNTS.map((presetAmount) => (
                <button
                  key={presetAmount}
                  style={{
                    flex: "1 1 30%",
                    padding: "12px 0",
                    background:
                      amount === presetAmount.toString()
                        ? "#F88D2A"
                        : "#f0f9ff",
                    color:
                      amount === presetAmount.toString() ? "#fff" : "#6BA43A",
                    border: "2px solid",
                    borderColor:
                      amount === presetAmount.toString()
                        ? "#F88D2A"
                        : "#e0f2fe",
                    borderRadius: 12,
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: "pointer",
                    marginBottom: 8,
                    transition: "all 0.2s",
                  }}
                  onClick={() => setAmount(presetAmount.toString())}
                >
                  ${presetAmount}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "#fff",
              border: "2px solid #F88D2A",
              borderRadius: 16,
              boxShadow: "0 2px 8px rgba(248,141,42,0.08)",
              padding: "clamp(12px,2vw,20px) clamp(8px,4vw,24px)",
              marginBottom: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "clamp(8px,2vw,16px)",
              width: "85%",
              maxWidth: 420,
            }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#F88D2A",
                marginBottom: 12,
                display: "block",
                letterSpacing: 0.5,
              }}
            >
              Monto personalizado
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "clamp(10px,3vw,24px)",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(16px,2vw,22px)",
                  fontWeight: 700,
                  color: "#F88D2A",
                  marginRight: 8,
                }}
              >
                $
              </span>
              <input
                style={{
                  flex: 1,
                  fontSize: "clamp(18px,4vw,28px)",
                  fontWeight: 700,
                  color: "#333",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  maxWidth: "clamp(80px,30vw,180px)",
                  minWidth: "clamp(50px,15vw,80px)",
                  textAlign: "center",
                  boxSizing: "border-box",
                  borderBottom: "2px solid #F88D2A",
                  borderRadius: 0,
                  padding: "clamp(4px,1vw,8px) 0",
                  appearance: "textfield",
                  transition: "border-color 0.2s",
                }}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setAmount(val);
                }}
                min="0"
                maxLength={10}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onKeyDown={(e) =>
                  (e.key === "-" || e.key === "+" || e.key === "e") &&
                  e.preventDefault()
                }
              />
              <span
                style={{
                  fontSize: "clamp(12px,2vw,18px)",
                  fontWeight: 700,
                  color: "#6ba43a",
                  marginLeft: 12,
                  whiteSpace: "nowrap",
                }}
              >
                USD
              </span>
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#F88D2A",
                marginBottom: 12,
                display: "block",
              }}
            >
              Método de pago
            </span>
            <div style={{ display: "flex", gap: 12 }}>
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "16px 0",
                    background:
                      selectedPaymentMethod === method.id ? "#fff8f0" : "#fff",
                    color:
                      selectedPaymentMethod === method.id ? "#4ecdc4" : "#333",
                    border: "2px solid",
                    borderColor:
                      selectedPaymentMethod === method.id
                        ? "#F88D2A"
                        : "#e0f2fe",
                    borderRadius: 12,
                    fontWeight: selectedPaymentMethod === method.id ? 700 : 600,
                    fontSize: 16,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    marginBottom: 8,
                    transition: "all 0.2s",
                  }}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  {method.name}
                  {selectedPaymentMethod === method.id && (
                    <span
                      style={{
                        fontSize: 18,
                        color: "#4ecdc4",
                        fontWeight: 700,
                      }}
                    >
                      ✔
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {amount && (
            <div
              style={{
                background: "#f8f9fa",
                borderRadius: 12,
                padding: "16px 20px",
                marginBottom: 24,
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#6BA43A",
                  marginBottom: 4,
                }}
              >
                Recibirás:{" "}
                <span>{Math.floor(Number(amount) / 0.05)} BeCoins</span>
              </div>
              <div style={{ fontSize: 14, color: "#999" }}>
                1 USD = 20 BeCoins
                <br />1 BeCoin = 0.05 USD
              </div>
            </div>
          )}
          {selectedPaymentMethod === "PAYPHONE" && (
            <>
              <div id="pp-button" style={{ marginBottom: 16 }}></div>
              {!isLoading && (
                <button
                  style={{
                    width: "100%",
                    background: "#F88D2A",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 18,
                    padding: "16px 0",
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 16px rgba(248,141,42,0.15)",
                    cursor: !amount ? "not-allowed" : "pointer",
                    opacity: !amount ? 0.6 : 1,
                    marginBottom: 8,
                    transition: "all 0.2s",
                  }}
                  onClick={async () => {
                    // Limpiar variables QR antes de iniciar recarga
                    localStorage.removeItem("payphone_to_wallet_id");
                    localStorage.removeItem("payphone_amount_to_payment_id");
                    localStorage.removeItem("payphone_is_qr_payment");
                    sessionStorage.removeItem("payphone_to_wallet_id");
                    sessionStorage.removeItem("payphone_amount_to_payment_id");
                    const ppDiv = document.getElementById("pp-button");
                    if (ppDiv) ppDiv.innerHTML = "";
                    setIsLoading(true);
                    setTimeout(async () => {
                      try {
                        await loadPayphoneScript();
                        const payphoneToken =
                          process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
                        localStorage.setItem("payphone_token", payphoneToken);
                        const payphoneConfig = {
                          token: payphoneToken,
                          clientTransactionId: `TX-${Date.now()}`,
                          amount: parseInt(amount) * 100,
                          amountWithoutTax: parseInt(amount) * 100,
                          currency: "USD",
                          storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
                          reference: "Recarga Beland",
                        };
                        // @ts-ignore
                        new window.PPaymentButtonBox(payphoneConfig).render(
                          "pp-button"
                        );
                      } catch (err) {
                        alert("No se pudo cargar el widget de Payphone.");
                        setIsLoading(false);
                      }
                    }, 0);
                  }}
                  disabled={!amount}
                >
                  Pagar con Payphone
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER MÓVIL ---
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Recargar BeCoins</Text>
      </View>
      {/* Montos predefinidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Montos rápidos</Text>
        <View style={styles.presetGrid}>
          {PRESET_AMOUNTS.map((presetAmount) => (
            <TouchableOpacity
              key={presetAmount}
              style={[
                styles.presetButton,
                amount === presetAmount.toString() &&
                  styles.presetButtonSelected,
              ]}
              onPress={() => setAmount(presetAmount.toString())}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  amount === presetAmount.toString() &&
                    styles.presetButtonTextSelected,
                ]}
              >
                ${presetAmount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Monto personalizado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monto personalizado</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.currencyLabel}>USD</Text>
        </View>
      </View>
      {/* Métodos de pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de pago</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === method.id &&
                styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <MaterialCommunityIcons
              name={method.icon as any}
              size={24}
              color={selectedPaymentMethod === method.id ? "#4ecdc4" : "#666"}
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method.id &&
                  styles.paymentMethodTextSelected,
              ]}
            >
              {method.name}
            </Text>
            {selectedPaymentMethod === method.id && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#4ecdc4"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      {/* Información de conversión */}
      {amount && (
        <View style={styles.conversionInfo}>
          <Text style={styles.conversionText}>
            Recibirás:{" "}
            <Text style={styles.conversionAmount}>{amount} BeCoins</Text>
          </Text>
          <Text style={styles.conversionNote}>1 USD = 1s BeCoin</Text>
        </View>
      )}
      {/* Botón de recarga */}
      {isLoading ? (
        <View style={[styles.rechargeButton, styles.rechargeButtonDisabled]}>
          <Text style={styles.rechargeButtonText}>Procesando...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.rechargeButton,
            (!amount || !selectedPaymentMethod) &&
              styles.rechargeButtonDisabled,
          ]}
          disabled={!amount || !selectedPaymentMethod}
        >
          <Text style={styles.rechargeButtonText}>Recargar BeCoins</Text>
        </TouchableOpacity>
      )}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#F88D2A",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F88D2A",
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  presetButton: {
    width: "30%",
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    alignItems: "center",
  },
  presetButtonSelected: {
    backgroundColor: "#F88D2A",
    borderColor: "#F88D2A",
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6BA43A",
  },
  presetButtonTextSelected: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#F88D2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F88D2A",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6BA43A",
    marginLeft: 8,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodSelected: {
    backgroundColor: "#fff8f0",
    borderColor: "#F88D2A",
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: "#4ecdc4",
    fontWeight: "600",
  },
  conversionInfo: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  conversionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  conversionAmount: {
    fontWeight: "bold",
    color: "#6BA43A",
  },
  conversionNote: {
    fontSize: 14,
    color: "#999",
  },
  rechargeButton: {
    backgroundColor: "#F88D2A",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rechargeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  rechargeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bottomSpace: {
    height: 40,
  },
});
