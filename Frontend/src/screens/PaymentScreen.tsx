import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../components/layout/RootStackNavigator";
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
  amount_to_payment_id?: string | null;
};

type PaymentScreenProps = {
  route: {
    params: {
      paymentData: PaymentData;
      amount_to_payment_id?: string | null;
    };
  };
};

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ route }) => {
  const { paymentData, amount_to_payment_id } = route.params;
  // LOGS DE DEPURACIÓN
  console.log("[PaymentScreen] paymentData:", paymentData);
  console.log("[PaymentScreen] amount_to_payment_id:", amount_to_payment_id);
  console.log(
    "[PaymentScreen] localStorage.payphone_is_qr_payment:",
    localStorage.getItem("payphone_is_qr_payment")
  );
  console.log(
    "[PaymentScreen] localStorage.payphone_to_wallet_id:",
    localStorage.getItem("payphone_to_wallet_id")
  );
  const PRESET_AMOUNTS = [10, 25, 50, 100, 200, 500];
  // Lógica según reglas del usuario:
  // Si amount === 0 y amount_to_payment_id existe => entrada gratuita
  // Si amount === 0 y NO existe amount_to_payment_id => monto editable
  // Si amount > 0 => monto fijo
  const isPresetFreeEntry =
    Number(paymentData.amount) === 0 && !!paymentData.amount_to_payment_id;
  const isEditableZero =
    Number(paymentData.amount) === 0 && !paymentData.amount_to_payment_id;
  const isFixedAmount = Number(paymentData.amount) > 0;

  const [amount, setAmount] = useState(
    isPresetFreeEntry
      ? "0"
      : isFixedAmount
      ? String(Number(paymentData.amount))
      : ""
  );
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const canEdit = isEditableZero;
  const isAmountValid =
    !canEdit ||
    (/^\d+$/.test(amount) && Number(amount) >= 1 && Number(amount) <= 99999999);
  const canPay =
    (canEdit && isAmountValid) ||
    (isPresetFreeEntry && amount === "0") ||
    (!canEdit && amount && Number(amount) >= 1 && Number(amount) <= 99999999);

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

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handlePayphoneWeb = async () => {
    console.log("[Payphone] paymentData:", paymentData);
    // Guardar datos QR en sessionStorage para que PayphoneSuccessScreen los lea después del pago
    if (paymentData.wallet_id || paymentData.amount_to_payment_id) {
      sessionStorage.setItem(
        "payphone_to_wallet_id",
        paymentData.wallet_id || ""
      );
      sessionStorage.setItem(
        "payphone_amount_to_payment_id",
        paymentData.amount_to_payment_id || ""
      );
      console.log("[Payphone][SessionStorage] Set QR Payment:", {
        wallet_id: paymentData.wallet_id,
        amount_to_payment_id: paymentData.amount_to_payment_id,
      });
    } else {
      sessionStorage.removeItem("payphone_to_wallet_id");
      sessionStorage.removeItem("payphone_amount_to_payment_id");
      console.log("[Payphone][SessionStorage] Limpieza de datos QR");
    }
    if (!isAmountValid) {
      setAmountError("El monto debe ser un entero entre 1 y 99999999");
      return;
    }
    setIsLoading(true);
    setAmountError(null);
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
        amount: Number(amount) * 100,
        amountWithoutTax: Number(amount) * 100,
        currency: "USD",
        storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
        reference: "Pago QR Beland",
        // Redirigir al usuario a la URL de éxito después del pago
        callback: `${window.location.origin}/wallet/payphone-success`,
      };
      // @ts-ignore
      new window.PPaymentButtonBox(payphoneConfig).render("pp-button");
    } catch (err) {
      Alert.alert("Error", "No se pudo cargar el widget de Payphone.");
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#f0f9ff",
        minHeight: "100vh",
        fontFamily: "'Inter', 'Roboto', 'Segoe UI', sans-serif",
        overflowY: "auto",
        padding: 0,
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
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: 32 }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#007AFF",
              letterSpacing: 1,
            }}
          >
            Pago QR
          </span>
        </div>
        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#007AFF",
              marginBottom: 12,
              display: "block",
            }}
          >
            Monto a pagar
          </span>
          {/* Solo mostrar input y presets si el monto es editable. Si viene definido, solo muestro el monto fijo. */}
          {canEdit ? (
            <>
              <input
                type="number"
                value={amount}
                min={1}
                max={99999999}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,8}$/.test(val)) {
                    setAmount(val);
                    setAmountError(null);
                  } else {
                    setAmountError(
                      "El monto debe ser un entero entre 1 y 99999999"
                    );
                  }
                }}
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#007AFF",
                  background: "#f5faff",
                  border: amountError
                    ? "2px solid #E53E3E"
                    : "2px solid #007AFF",
                  borderRadius: 12,
                  padding: "12px 16px",
                  width: "100%",
                  maxWidth: 380,
                  marginTop: 8,
                  outline: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "border 0.2s",
                }}
              />
              {amountError && (
                <span
                  style={{
                    fontSize: 13,
                    color: "#E53E3E",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  {amountError}
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 10,
                  flexWrap: "wrap",
                }}
              >
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    style={{
                      flex: "1 1 30%",
                      padding: "10px 0",
                      background:
                        Number(amount) === preset ? "#007AFF" : "#f0f9ff",
                      color: Number(amount) === preset ? "#fff" : "#007AFF",
                      border: "2px solid",
                      borderColor:
                        Number(amount) === preset ? "#007AFF" : "#e0f2fe",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: "pointer",
                      marginBottom: 6,
                      transition: "all 0.2s",
                    }}
                    onClick={() => setAmount(String(preset))}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </>
          ) : isPresetFreeEntry ? (
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 18,
                  color: "#6BA43A",
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                Entrada gratuita
              </span>
              <span
                style={{
                  fontSize: 22,
                  color: "#007AFF",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  display: "block",
                }}
              >
                $0.00
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: 20,
                color: "#007AFF",
                fontWeight: 700,
                display: "block",
                marginTop: 12,
              }}
            >
              ${amount}
            </span>
          )}
        </div>
        {paymentData.message && (
          <div style={{ marginBottom: 16, color: "#333", fontSize: 15 }}>
            {paymentData.message}
          </div>
        )}
        {paymentData.resource && paymentData.resource.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#007AFF",
                marginBottom: 8,
                display: "block",
              }}
            >
              Recursos y descuentos
            </span>
            {paymentData.resource.map((res: Resource) => (
              <div
                key={res.id}
                style={{
                  background: "#f5faff",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{ fontWeight: 600, color: "#6BA43A", fontSize: 15 }}
                >
                  {res.resource_name}
                </div>
                <div style={{ color: "#666", fontSize: 13 }}>
                  {res.resource_desc}
                </div>
                <div style={{ color: "#333", fontSize: 13 }}>
                  Cantidad: {res.resource_quanity}
                </div>
                <div style={{ color: "#F88D2A", fontSize: 13 }}>
                  Descuento: {res.resource_discount}%
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginBottom: 24 }}>
          {isPresetFreeEntry && amount === "0" ? (
            <button
              style={{
                background: "#6BA43A",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                padding: "16px 0",
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 16px rgba(107,164,58,0.15)",
                cursor: !isLoading ? "pointer" : "not-allowed",
                opacity: !isLoading ? 1 : 0.6,
                width: "100%",
                marginBottom: 8,
                transition: "all 0.2s",
              }}
              onClick={async () => {
                if (isLoading) return;
                try {
                  setIsLoading(true);
                  // Lógica para compra gratuita (monto 0)
                  // Construir objeto con los datos requeridos por el backend
                  const purchaseData: any = {
                    toWalletId: paymentData.wallet_id,
                    amountBecoin: 0,
                  };
                  if (paymentData.amount_to_payment_id) {
                    purchaseData.amount_payment_id =
                      paymentData.amount_to_payment_id;
                  }
                  if (
                    paymentData.resource &&
                    paymentData.resource.length > 0 &&
                    paymentData.resource[0].id
                  ) {
                    purchaseData.user_resource_id = paymentData.resource[0].id;
                  }
                  await require("../services/walletService").walletService.createPurchaseBecoin(
                    purchaseData
                  );
                  Alert.alert(
                    "Compra registrada",
                    "La entrada gratuita fue registrada correctamente."
                  );

                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs", params: { screen: "Home" } }],
                  });
                } catch (err) {
                  Alert.alert(
                    "Error",
                    "No se pudo registrar la entrada gratuita"
                  );
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? "Procesando..." : "Registrar entrada gratuita"}
            </button>
          ) : (
            <button
              style={{
                background: canPay && !isLoading ? "#007AFF" : "#ccc",
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
                padding: "16px 0",
                borderRadius: 12,
                border: "none",
                boxShadow:
                  canPay && !isLoading
                    ? "0 4px 16px rgba(0,122,255,0.15)"
                    : "none",
                cursor: canPay && !isLoading ? "pointer" : "not-allowed",
                opacity: canPay && !isLoading ? 1 : 0.6,
                width: "100%",
                marginBottom: 8,
                transition: "all 0.2s",
              }}
              onClick={handlePayphoneWeb}
              disabled={!canPay || isLoading}
            >
              {isLoading ? "Procesando..." : "Confirmar pago"}
            </button>
          )}
          <button
            style={{
              background: "#fff",
              color: "#007AFF",
              fontWeight: 600,
              fontSize: 16,
              padding: "12px 0",
              borderRadius: 12,
              border: "2px solid #007AFF",
              width: "100%",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              cursor: "pointer",
              marginBottom: 4,
            }}
            onClick={() => window.history.back()}
          >
            Cancelar
          </button>
        </div>
        {!isPresetFreeEntry && (
          <div style={{ width: "100%", marginTop: 24 }}>
            <div id="pp-button" style={{ marginBottom: 16 }}></div>
          </div>
        )}
      </div>
    </div>
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
