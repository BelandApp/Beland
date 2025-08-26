import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";

type Resource = {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_quanity: number;
  resource_discount: number;
};

type PaymentData = {
  amount: number;
  message?: string;
  resource?: Resource[];
  wallet_id?: string;
};

type PaymentScreenProps = {
  route: {
    params: {
      paymentData: PaymentData;
    };
  };
};

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const { paymentData } = route.params;
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar el script Payphone en web
  function loadPayphoneScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!document.getElementById("payphone-css")) {
        const link = document.createElement("link");
        link.id = "payphone-css";
        link.rel = "stylesheet";
        link.href =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
        document.head.appendChild(link);
      }
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

  // Handler para pago con Payphone en web
  const handlePayphoneWeb = async () => {
    setIsLoading(true);
    const ppDiv = document.getElementById("pp-button");

    if (ppDiv) ppDiv.innerHTML = "";
    try {
      await loadPayphoneScript();

      const payphoneToken = process.env.EXPO_PUBLIC_PAYPHONE_TOKEN;
      localStorage.setItem("payphone_token", payphoneToken);
      // @ts-ignore
      const payphoneConfig = {
        token: payphoneToken,
        clientTransactionId: `TX-${Date.now()}`,
        amount: paymentData.amount * 100,
        amountWithoutTax: paymentData.amount * 100,
        currency: "USD",
        storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
        reference: "Pago QR Beland",
      };

      // @ts-ignore
      new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el widget de Payphone.");
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
    >
      <View style={styles.cardMain}>
        <View style={styles.headerIconWrap}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>💸</Text>
          </View>
        </View>
        <Text style={styles.title}>Pago QR</Text>
        <View style={styles.amountWrap}>
          <Text style={styles.label}>Monto a pagar</Text>
          <Text style={styles.value}>
            {paymentData.amount} <Text style={styles.coin}>BeCoins</Text>
          </Text>
        </View>
        {paymentData.message ? (
          <Text style={styles.message}>{paymentData.message}</Text>
        ) : null}
        {paymentData.resource && paymentData.resource.length > 0 && (
          <View style={styles.resourceSection}>
            <Text style={styles.label}>Recursos y descuentos</Text>
            {paymentData.resource.map((res: Resource) => (
              <View key={res.id} style={styles.resourceItem}>
                <Text style={styles.resourceName}>{res.resource_name}</Text>
                <Text style={styles.resourceDesc}>{res.resource_desc}</Text>
                <Text style={styles.resourceQty}>
                  Cantidad: {res.resource_quanity}
                </Text>
                <Text style={styles.resourceDiscount}>
                  Descuento: {res.resource_discount}%
                </Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.buttonRow}>
          {Platform.OS === "web" ? (
            <button
              style={{
                backgroundColor: "#007AFF",
                borderRadius: 10,
                padding: 12,
                width: "100%",
                marginRight: 8,
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                letterSpacing: 0.5,
                border: "none",
                cursor: isLoading ? "not-allowed" : "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
              onClick={handlePayphoneWeb}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Confirmar pago"}
            </button>
          ) : (
            <View style={styles.buttonPrimary}>
              <Text style={styles.buttonText}>Confirmar pago</Text>
            </View>
          )}
          <View style={styles.buttonSecondary}>
            <Text style={styles.buttonTextSec}>Cancelar</Text>
          </View>
        </View>
        {/* Widget Payphone solo en web, sin botón extra */}
        {Platform.OS === "web" && (
          <View style={{ width: "100%", marginTop: 24 }}>
            <View id="pp-button" style={{ marginBottom: 16 }}></View>
          </View>
        )}
        {/* Placeholder para mobile */}
        {Platform.OS !== "web" && (
          <View style={{ width: "100%", marginTop: 24 }}>
            <View style={styles.buttonPrimary}>
              <Text style={styles.buttonText}>
                Pagar con Payphone (próximamente)
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9f0fb",
    padding: 20,
  },
  cardMain: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#007AFF",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginVertical: 30,
    alignItems: "center",
  },
  headerIconWrap: {
    alignItems: "center",
    marginBottom: 10,
  },
  iconCircle: {
    backgroundColor: "#e3f2fd",
    borderRadius: 40,
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#007AFF",
    textAlign: "center",
    letterSpacing: 1,
  },
  amountWrap: {
    backgroundColor: "#f5faff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    alignItems: "center",
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    color: "#007AFF",
    fontWeight: "bold",
    marginBottom: 2,
  },
  coin: {
    fontSize: 16,
    color: "#0097a7",
    fontWeight: "600",
  },
  message: {
    fontSize: 15,
    color: "#0097a7",
    marginVertical: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  resourceSection: {
    marginTop: 18,
    backgroundColor: "#f7f8fa",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    width: "100%",
  },
  resourceItem: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    shadowColor: "#007AFF",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  resourceName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 2,
  },
  resourceDesc: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  resourceQty: {
    fontSize: 13,
    color: "#888",
    marginBottom: 2,
  },
  resourceDiscount: {
    fontSize: 13,
    color: "#E53E3E",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    width: "100%",
  },
  buttonPrimary: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: "#e3f2fd",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonTextSec: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default PaymentScreen;
