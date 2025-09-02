import React, { useState } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../components/layout/RootStackNavigator";
import { Alert } from "react-native";
import { CustomAlert } from "../components/ui/CustomAlert";
import { BeCoinIcon } from "../components/icons/BeCoinIcon";
import PayphoneIcon from "../components/icons/PayphoneIcon";
import { TransactionContextManager } from "../hooks/usePaymentSocket";

type Resource = {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_quanity: number;
  resource_discount: number;
};

type Redemption = {
  id: string;
  code: string;
  type: "DISCOUNT" | "BONUS_COINS" | "CIRCULARES";
  value: number;
  is_redeemed: boolean;
  expires_at?: string;
  description?: string;
};

type PaymentData = {
  commerce_name?: string;
  commerce_img?: string;
  amount: number;
  message?: string;
  resource?: Resource[];
  redemptions?: Redemption[];
  wallet_id?: string;
  amount_to_payment_id?: string | null;
  noHidden?: boolean;
};

type PaymentScreenParamList = {
  PaymentScreen: {
    paymentData: PaymentData;
    amount_to_payment_id?: string | null;
  };
};

type PaymentScreenRouteProp = RouteProp<
  PaymentScreenParamList,
  "PaymentScreen"
>;

const PaymentScreen: React.FC = () => {
  const route = useRoute<PaymentScreenRouteProp>();
  const [showFreeAlert, setShowFreeAlert] = useState(false);
  const [showPaymentSuccessAlert, setShowPaymentSuccessAlert] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"payphone" | "becoin">(
    "payphone"
  );
  const [appliedRedemption, setAppliedRedemption] = useState<Redemption | null>(
    null
  );
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [discountedAmount, setDiscountedAmount] = useState<number>(0);
  const [isFreeEntry, setIsFreeEntry] = useState(false);
  const [backendResponse, setBackendResponse] = useState<any>(null);

  const { paymentData, amount_to_payment_id } = route.params;
  const comercioNombre = paymentData.commerce_name || "Comercio Beland";
  // Imagen genérica azul tipo Mercado Pago para el perfil
  const defaultProfileImg =
    "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
  const comercioImg = paymentData.commerce_img || defaultProfileImg;

  const PRESET_AMOUNTS = [10, 25, 50, 100, 200, 500];
  const BECOIN_TO_USD_RATE = 0.05; // 1 BeCoin = $0.05 USD

  // Función para convertir USD a BeCoins
  const usdToBeCoins = (usdAmount: number): number => {
    return Math.ceil(usdAmount / BECOIN_TO_USD_RATE); // Redondear hacia arriba
  };

  // Función para convertir BeCoins a USD
  const beCoinsToUsd = (beCoins: number): number => {
    return beCoins * BECOIN_TO_USD_RATE;
  };

  // Inicializar montos originales
  React.useEffect(() => {
    setOriginalAmount(Number(paymentData.amount));
    setDiscountedAmount(Number(paymentData.amount));
  }, [paymentData.amount]);

  // Función para aplicar redención
  const applyRedemption = (redemption: Redemption) => {
    if (appliedRedemption?.id === redemption.id) {
      // Si ya está aplicada, la removemos
      setAppliedRedemption(null);
      setDiscountedAmount(originalAmount);
      setIsFreeEntry(false);
      return;
    }

    setAppliedRedemption(redemption);

    if (redemption.type === "DISCOUNT") {
      const discountPercent = redemption.value;
      const newAmount = originalAmount * (1 - discountPercent / 100);
      setDiscountedAmount(Math.max(0, newAmount));

      // Si el descuento es 100%, es entrada gratis
      if (discountPercent >= 100) {
        setIsFreeEntry(true);
        setDiscountedAmount(0);
      } else {
        setIsFreeEntry(false);
      }
    }
  };

  // Función para obtener el monto efectivo a pagar
  const getEffectiveAmount = (): number => {
    return appliedRedemption ? discountedAmount : originalAmount;
  };

  const isPresetFreeEntry =
    Number(paymentData.amount) === 0 && !!paymentData.amount_to_payment_id;
  const isEditableZero =
    Number(paymentData.amount) === 0 && !paymentData.amount_to_payment_id;
  const isFixedAmount = Number(paymentData.amount) > 0;

  const [amount, setAmount] = useState(
    isPresetFreeEntry ? "0" : isFixedAmount ? String(getEffectiveAmount()) : ""
  );
  const [amountError, setAmountError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar amount cuando se aplica/remueve redención
  React.useEffect(() => {
    if (isFixedAmount) {
      setAmount(String(getEffectiveAmount()));
    }
  }, [appliedRedemption, discountedAmount, originalAmount]);

  const canEdit = isEditableZero;
  const isAmountValid =
    !canEdit ||
    (/^\d+$/.test(amount) && Number(amount) >= 1 && Number(amount) <= 99999999);
  const canPay =
    isFreeEntry ||
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

      // Guardar información de redención aplicada
      if (appliedRedemption) {
        sessionStorage.setItem(
          "payphone_applied_redemption",
          JSON.stringify({
            id: appliedRedemption.id,
            code: appliedRedemption.code,
            value: appliedRedemption.value,
            original_amount: originalAmount,
            discounted_amount: getEffectiveAmount(),
            is_free_entry: isFreeEntry,
          })
        );
      } else {
        sessionStorage.removeItem("payphone_applied_redemption");
      }

      console.log("[Payphone][SessionStorage] Set QR Payment:", {
        wallet_id: paymentData.wallet_id,
        amount_to_payment_id: paymentData.amount_to_payment_id,
        applied_redemption: appliedRedemption?.code || "none",
      });
    } else {
      sessionStorage.removeItem("payphone_to_wallet_id");
      sessionStorage.removeItem("payphone_amount_to_payment_id");
      sessionStorage.removeItem("payphone_applied_redemption");
      console.log("[Payphone][SessionStorage] Limpieza de datos QR");
    }

    // Si es entrada gratis, procesar directamente sin Payphone
    if (isFreeEntry) {
      try {
        const freeEntryData: any = {
          toWalletId: paymentData.wallet_id,
          amountBecoin: 0,
        };
        if (paymentData.amount_to_payment_id) {
          freeEntryData.amount_payment_id = paymentData.amount_to_payment_id;
        }
        if (
          Array.isArray(paymentData.resource) &&
          paymentData.resource.length > 0 &&
          paymentData.resource[0].id
        ) {
          freeEntryData.user_resource_id = paymentData.resource[0].id;
        }
        if (appliedRedemption) {
          freeEntryData.applied_redemption_id = appliedRedemption.id;
          freeEntryData.redemption_discount = appliedRedemption.value;
          freeEntryData.original_amount = originalAmount;
          freeEntryData.discounted_amount = 0;
        }

        // Agregar información adicional para notificación al superadmin
        if (
          Array.isArray(paymentData.resource) &&
          paymentData.resource.length > 0
        ) {
          freeEntryData.resource_name = paymentData.resource[0].resource_name;
          freeEntryData.resource_quantity =
            paymentData.resource[0].resource_quanity;
        }
        freeEntryData.transaction_type = "free_entry";
        if (appliedRedemption) {
          freeEntryData.transaction_type = "redemption_applied";
          freeEntryData.redemption_code = appliedRedemption.code;
        }
        freeEntryData.commerce_name =
          paymentData.commerce_name || "Comercio Beland";
        freeEntryData.becoins_used = 0;

        const response =
          await require("../services/walletService").walletService.createPurchaseBecoin(
            freeEntryData
          );

        // Guardar información detallada para la notificación
        setBackendResponse(response);

        // Guardar contexto de transacción para enriquecer notificaciones
        const contextManager = TransactionContextManager.getInstance();
        contextManager.addTransaction({
          timestamp: Date.now(),
          amount: 0, // Entrada gratis
          type: appliedRedemption ? "redemption_applied" : "free_entry",
          resourceName: freeEntryData.resource_name,
          resourceQuantity: freeEntryData.resource_quantity,
          redemptionCode: appliedRedemption?.code,
          becoinsUsed: 0,
          commerceName: freeEntryData.commerce_name,
        });

        console.log(
          "[TransactionContext] Contexto guardado para entrada gratis:",
          {
            amount: 0,
            type: appliedRedemption ? "redemption_applied" : "free_entry",
            resourceName: freeEntryData.resource_name,
            redemptionCode: appliedRedemption?.code,
          }
        );

        // Mostrar alerta según noHidden del backend o del paymentData
        const shouldStayVisible = response?.noHidden || paymentData.noHidden;
        if (shouldStayVisible) {
          // Mostrar alerta persistente con botón OK
          setShowFreeAlert(true);
        } else {
          // Mostrar alerta temporal y navegar
          setShowFreeAlert(true);
          setTimeout(() => {
            setShowFreeAlert(false);
            navigation.goBack();
          }, 2000);
        }
        setIsLoading(false);
        return;
      } catch (error) {
        console.error("Error al procesar entrada gratis:", error);
        Alert.alert("Error", "No se pudo procesar la entrada gratis");
        setIsLoading(false);
        return;
      }
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
        amount: getEffectiveAmount() * 100, // Usar monto con descuento aplicado
        amountWithoutTax: getEffectiveAmount() * 100,
        currency: "USD",
        storeId: process.env.EXPO_PUBLIC_PAYPHONE_STOREID,
        reference: appliedRedemption
          ? `Pago QR Beland - Cupón: ${appliedRedemption.code}`
          : "Pago QR Beland",
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
    <>
      <style>
        {`
          .no-spinner::-webkit-outer-spin-button,
          .no-spinner::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .no-spinner[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      <div
        style={{
          background: "#f7fafd",
          minHeight: "100vh",
          fontFamily: "'Inter', 'Roboto', 'Segoe UI', sans-serif",
          overflowY: "auto",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            margin: "32px auto",
            background: "#fff",
            borderRadius: 28,
            boxShadow: "0 6px 32px rgba(0,0,0,0.10)",
            padding: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Encabezado profesional con imagen del comercio */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                background: "#e3f2fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px #007AFF22",
                marginBottom: 8,
                overflow: "hidden",
              }}
            >
              <img
                src={comercioImg}
                alt="Comercio"
                style={{ width: 56, height: 56, objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";
                }}
              />
            </div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#007AFF",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              {comercioNombre}
            </span>
          </div>

          {/* Monto grande, centrado y profesional */}
          <div
            style={{
              textAlign: "center",
              marginBottom: 28,
              background: "#f5faff",
              borderRadius: 18,
              boxShadow: "0 2px 8px #007AFF11",
              padding: "18px 0 10px 0",
              width: "100%",
            }}
          >
            {canEdit ? (
              <input
                type="text"
                value={amount ? `$${Number(amount).toLocaleString()}` : ""}
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={(e) => {
                  const val = e.target.value.replace(/[$,]/g, ""); // Remover $ y comas
                  // Solo permitir números sin símbolos
                  if (/^\d{0,8}$/.test(val)) {
                    setAmount(val);
                    setAmountError(null);
                  } else if (val === "") {
                    setAmount("");
                    setAmountError(null);
                  } else {
                    setAmountError(
                      "Solo se permiten números del 1 al 99999999"
                    );
                  }
                }}
                onKeyDown={(e) => {
                  // Prevenir entrada de símbolos, letras y caracteres especiales
                  if (
                    !/[0-9]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#007AFF",
                  letterSpacing: 1,
                  marginBottom: 0,
                  display: "block",
                  textShadow: "0 2px 8px #007AFF22",
                  fontFamily: "inherit",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  textAlign: "center",
                  width: "100%",
                  appearance: "none",
                  MozAppearance: "textfield", // Firefox
                  WebkitAppearance: "none", // Safari/Chrome
                }}
                className="no-spinner"
                placeholder="$0.00"
              />
            ) : (
              <span
                style={{
                  fontSize: 44,
                  fontWeight: 900,
                  color: "#007AFF",
                  letterSpacing: 1,
                  marginBottom: 0,
                  display: "block",
                  textShadow: "0 2px 8px #007AFF22",
                  fontFamily: "inherit",
                }}
              >
                {isPresetFreeEntry
                  ? "$0,00"
                  : Number(amount).toLocaleString("es-EC", {
                      style: "currency",
                      currency: "USD",
                    })}
              </span>
            )}
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
            {isPresetFreeEntry && (
              <span
                style={{
                  fontSize: 18,
                  color: "#6BA43A",
                  fontWeight: 700,
                  marginTop: 2,
                  display: "block",
                }}
              >
                Entrada gratuita
              </span>
            )}
            <div
              style={{
                margin: "10px auto 0 auto",
                width: "80%",
                height: 1,
                background: "#e0e7ef",
              }}
            ></div>
            {paymentData.message && (
              <div
                style={{
                  fontSize: 15,
                  color: "#888",
                  marginTop: 12,
                  textAlign: "center",
                  maxWidth: 320,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                {paymentData.message}
              </div>
            )}

            {/* Información de conversión para BeCoins */}
            {selectedMethod === "becoin" && amount && Number(amount) > 0 && (
              <div
                style={{
                  fontSize: 14,
                  color: "#43b86a",
                  marginTop: 8,
                  textAlign: "center",
                  fontWeight: 600,
                  background: "#f0f9f5",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid #e8f5e8",
                }}
              >
                = {usdToBeCoins(Number(amount)).toLocaleString()} BeCoins
              </div>
            )}
          </div>

          {/* Selector de método de pago profesional tipo tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 28,
              gap: 0,
              background: "#f7fafd",
              borderRadius: 16,
              boxShadow: "0 2px 8px #007AFF11",
              border: "1.5px solid #e0e7ef",
              width: "100%",
              maxWidth: 340,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                background: selectedMethod === "payphone" ? "#fff" : "#f7fafd",
                border: "none",
                borderRight: "1.5px solid #e0e7ef",
                outline: "none",
                padding: "18px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 17,
                color: selectedMethod === "payphone" ? "#FF8000" : "#888",
                boxShadow:
                  selectedMethod === "payphone"
                    ? "0 2px 8px #FF800022"
                    : "none",
                borderRadius:
                  selectedMethod === "payphone"
                    ? "16px 0 0 16px"
                    : "16px 0 0 16px",
                transition: "all 0.2s",
              }}
              onClick={() => setSelectedMethod("payphone")}
            >
              <PayphoneIcon width={28} height={28} />
              <span style={{ marginLeft: 8 }}>Payphone</span>
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                background: selectedMethod === "becoin" ? "#fff" : "#f7fafd",
                border: "none",
                outline: "none",
                padding: "18px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 17,
                color: selectedMethod === "becoin" ? "#43b86a" : "#888",
                boxShadow:
                  selectedMethod === "becoin" ? "0 2px 8px #43b86a22" : "none",
                borderRadius:
                  selectedMethod === "becoin"
                    ? "0 16px 16px 0"
                    : "0 16px 16px 0",
                borderLeft: "1.5px solid #e0e7ef",
                transition: "all 0.2s",
              }}
              onClick={() => setSelectedMethod("becoin")}
            >
              <BeCoinIcon />
              <span style={{ marginLeft: 8 }}>BeCoins</span>
            </button>
          </div>

          {/* Botones de montos predefinidos - Solo mostrar si NO es entrada gratuita Y NO es monto fijo */}
          {!isPresetFreeEntry && !isFixedAmount && (
            <div
              style={{
                marginBottom: 18,
                width: "100%",
                maxWidth: 340,
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: canEdit ? 0 : 12,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    style={{
                      flex: "1 1 30%",
                      padding: "12px 0",
                      background:
                        Number(amount) === preset ? "#007AFF" : "#f0f9ff",
                      color: Number(amount) === preset ? "#fff" : "#007AFF",
                      border:
                        Number(amount) === preset
                          ? "2px solid #007AFF"
                          : "2px solid #e0f2fe",
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: canEdit ? "pointer" : "not-allowed",
                      marginBottom: 6,
                      boxShadow:
                        Number(amount) === preset
                          ? "0 2px 8px #007AFF22"
                          : "none",
                      transition: "all 0.2s",
                      opacity: canEdit ? 1 : 0.6,
                    }}
                    onClick={() => {
                      if (canEdit) {
                        setAmount(String(preset));
                        setAmountError(null);
                      }
                    }}
                    disabled={!canEdit}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recursos y descuentos */}
          {Array.isArray(paymentData.resource) &&
            paymentData.resource.length > 0 && (
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
                      boxShadow: "0 2px 8px #43b86a22",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#6BA43A",
                        fontSize: 15,
                      }}
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

          {/* Redenciones y Cupones */}
          {Array.isArray(paymentData.redemptions) &&
            paymentData.redemptions.length > 0 && (
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
                  Cupones disponibles
                </span>
                {paymentData.redemptions.map((redemption: Redemption) => (
                  <div
                    key={redemption.id}
                    style={{
                      background:
                        appliedRedemption?.id === redemption.id
                          ? "#e8f5e8"
                          : "#fff5f0",
                      borderRadius: 12,
                      padding: "12px 16px",
                      marginBottom: 12,
                      border:
                        appliedRedemption?.id === redemption.id
                          ? "2px solid #28a745"
                          : "1px solid #ffa726",
                      boxShadow:
                        appliedRedemption?.id === redemption.id
                          ? "0 4px 12px rgba(40, 167, 69, 0.2)"
                          : "0 2px 8px rgba(255, 167, 38, 0.15)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            color: "#ff6600",
                            fontSize: 14,
                            marginBottom: 4,
                          }}
                        >
                          Cupón: {redemption.code}
                        </div>
                        {redemption.description && (
                          <div
                            style={{
                              color: "#666",
                              fontSize: 12,
                              marginBottom: 4,
                            }}
                          >
                            {redemption.description}
                          </div>
                        )}
                        <div
                          style={{
                            color:
                              redemption.type === "DISCOUNT"
                                ? "#28a745"
                                : "#007AFF",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {redemption.type === "DISCOUNT" &&
                            `${redemption.value}% de descuento`}
                          {redemption.type === "BONUS_COINS" &&
                            `+${redemption.value} BeCoins`}
                          {redemption.type === "CIRCULARES" &&
                            `${redemption.value} recursos circulares`}
                        </div>
                        {redemption.expires_at && (
                          <div
                            style={{
                              color: "#999",
                              fontSize: 11,
                              marginTop: 2,
                            }}
                          >
                            Expira:{" "}
                            {new Date(
                              redemption.expires_at
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => applyRedemption(redemption)}
                        disabled={redemption.is_redeemed}
                        style={{
                          backgroundColor:
                            appliedRedemption?.id === redemption.id
                              ? "#28a745"
                              : redemption.is_redeemed
                              ? "#ccc"
                              : "#ff6600",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: redemption.is_redeemed
                            ? "not-allowed"
                            : "pointer",
                          transition: "all 0.2s ease",
                          opacity: redemption.is_redeemed ? 0.6 : 1,
                        }}
                      >
                        {appliedRedemption?.id === redemption.id
                          ? "Aplicado ✓"
                          : redemption.is_redeemed
                          ? "Usado"
                          : "Usar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          {/* Descuento aplicado */}
          {appliedRedemption && (
            <div
              style={{
                background: "linear-gradient(135deg, #28a745, #20c997)",
                borderRadius: 12,
                padding: "12px 16px",
                marginBottom: 20,
                color: "white",
                boxShadow: "0 4px 12px rgba(40, 167, 69, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    Cupón aplicado: {appliedRedemption.code}
                  </div>
                  {appliedRedemption.type === "DISCOUNT" && (
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      Descuento: {appliedRedemption.value}%
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, opacity: 0.9 }}>
                    Monto original: ${originalAmount.toFixed(2)}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {isFreeEntry
                      ? "¡GRATIS!"
                      : `Nuevo monto: $${discountedAmount.toFixed(2)}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón de acción principal según método seleccionado */}
          <div style={{ marginBottom: 24, width: "100%" }}>
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
                  position: "sticky",
                  bottom: 0,
                  transition: "all 0.2s",
                }}
                onClick={async () => {
                  if (isLoading) return;
                  try {
                    setIsLoading(true);
                    // Lógica para compra gratuita (monto 0)
                    const purchaseData: any = {
                      toWalletId: paymentData.wallet_id,
                      amountBecoin: 0,
                    };
                    if (paymentData.amount_to_payment_id) {
                      purchaseData.amount_payment_id =
                        paymentData.amount_to_payment_id;
                    }
                    if (
                      Array.isArray(paymentData.resource) &&
                      paymentData.resource.length > 0 &&
                      paymentData.resource[0].id
                    ) {
                      purchaseData.user_resource_id =
                        paymentData.resource[0].id;
                    }

                    // Agregar información adicional para notificación al superadmin
                    if (
                      Array.isArray(paymentData.resource) &&
                      paymentData.resource.length > 0
                    ) {
                      purchaseData.resource_name =
                        paymentData.resource[0].resource_name;
                      purchaseData.resource_quantity =
                        paymentData.resource[0].resource_quanity;
                    }
                    purchaseData.transaction_type = "free_entry";
                    purchaseData.commerce_name =
                      paymentData.commerce_name || "Comercio Beland";
                    purchaseData.becoins_used = 0;

                    const response =
                      await require("../services/walletService").walletService.createPurchaseBecoin(
                        purchaseData
                      );

                    // Guardar información detallada para la notificación
                    setBackendResponse(response);

                    // Guardar contexto de transacción para enriquecer notificaciones
                    const contextManager =
                      TransactionContextManager.getInstance();
                    contextManager.addTransaction({
                      timestamp: Date.now(),
                      amount: 0, // Entrada gratis
                      type: "free_entry",
                      resourceName: purchaseData.resource_name,
                      resourceQuantity: purchaseData.resource_quantity,
                      becoinsUsed: 0,
                      commerceName: purchaseData.commerce_name,
                    });

                    console.log(
                      "[TransactionContext] Contexto guardado para entrada gratuita (botón):",
                      {
                        amount: 0,
                        type: "free_entry",
                        resourceName: purchaseData.resource_name,
                      }
                    );

                    setShowFreeAlert(true);
                  } catch (err) {
                    setShowFreeAlert(true);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Registrar entrada gratuita"}
              </button>
            ) : selectedMethod === "payphone" ? (
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
                    canPay && !isLoading ? "0 4px 16px #007AFF22" : "none",
                  cursor: canPay && !isLoading ? "pointer" : "not-allowed",
                  opacity: canPay && !isLoading ? 1 : 0.6,
                  width: "100%",
                  marginBottom: 8,
                  position: "sticky",
                  bottom: 0,
                  transition: "all 0.2s",
                }}
                onClick={handlePayphoneWeb}
                disabled={!canPay || isLoading}
              >
                {isLoading
                  ? "Procesando..."
                  : isFreeEntry
                  ? "Ingresar gratis"
                  : "Pagar con Payphone"}
              </button>
            ) : (
              <button
                style={{
                  background: canPay && !isLoading ? "#43b86a" : "#ccc",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 18,
                  padding: "16px 0",
                  borderRadius: 12,
                  border: "none",
                  boxShadow:
                    canPay && !isLoading ? "0 4px 16px #43b86a22" : "none",
                  cursor: canPay && !isLoading ? "pointer" : "not-allowed",
                  opacity: canPay && !isLoading ? 1 : 0.6,
                  width: "100%",
                  marginBottom: 8,
                  position: "sticky",
                  bottom: 0,
                  transition: "all 0.2s",
                }}
                onClick={async () => {
                  if (!canPay || isLoading) return;
                  try {
                    setIsLoading(true);
                    // Lógica para pagar con saldo BeCoins - Convertir USD a BeCoins
                    const effectiveAmount = getEffectiveAmount();
                    const beCoinsAmount = isFreeEntry
                      ? 0
                      : usdToBeCoins(effectiveAmount);
                    const purchaseData: any = {
                      toWalletId: paymentData.wallet_id,
                      amountBecoin: beCoinsAmount,
                    };
                    if (paymentData.amount_to_payment_id) {
                      purchaseData.amount_payment_id =
                        paymentData.amount_to_payment_id;
                    }
                    if (
                      Array.isArray(paymentData.resource) &&
                      paymentData.resource.length > 0 &&
                      paymentData.resource[0].id
                    ) {
                      purchaseData.user_resource_id =
                        paymentData.resource[0].id;
                    }
                    // Agregar información de redención aplicada
                    if (appliedRedemption) {
                      purchaseData.applied_redemption_id = appliedRedemption.id;
                      purchaseData.redemption_discount =
                        appliedRedemption.value;
                      purchaseData.original_amount = originalAmount;
                      purchaseData.discounted_amount = effectiveAmount;
                    }

                    // Agregar información adicional para notificación al superadmin
                    if (
                      Array.isArray(paymentData.resource) &&
                      paymentData.resource.length > 0
                    ) {
                      purchaseData.resource_name =
                        paymentData.resource[0].resource_name;
                      purchaseData.resource_quantity =
                        paymentData.resource[0].resource_quanity;
                    }
                    purchaseData.transaction_type = isFreeEntry
                      ? "free_entry"
                      : "paid_entry";
                    if (appliedRedemption) {
                      purchaseData.transaction_type = "redemption_applied";
                      purchaseData.redemption_code = appliedRedemption.code;
                    }
                    purchaseData.commerce_name =
                      paymentData.commerce_name || "Comercio Beland";
                    purchaseData.becoins_used = beCoinsAmount;

                    const response =
                      await require("../services/walletService").walletService.createPurchaseBecoin(
                        purchaseData
                      );

                    // Guardar contexto de transacción para enriquecer notificaciones
                    const contextManager =
                      TransactionContextManager.getInstance();
                    contextManager.addTransaction({
                      timestamp: Date.now(),
                      amount: effectiveAmount, // Monto final pagado
                      type: appliedRedemption ? "redemption_applied" : "becoin",
                      resourceName: purchaseData.resource_name,
                      resourceQuantity: purchaseData.resource_quantity,
                      redemptionCode: appliedRedemption?.code,
                      becoinsUsed: beCoinsAmount,
                      commerceName: purchaseData.commerce_name,
                    });

                    // Guardar información detallada para la notificación
                    setBackendResponse(response);

                    setShowPaymentSuccessAlert(true);
                  } catch (err) {
                    setShowPaymentSuccessAlert(true);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={!canPay || isLoading}
              >
                {isLoading
                  ? "Procesando..."
                  : isFreeEntry
                  ? "Ingresar gratis"
                  : `Pagar ${usdToBeCoins(
                      Number(amount || 0)
                    ).toLocaleString()} BeCoins`}
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
                boxShadow: "0 2px 8px #007AFF11",
                cursor: "pointer",
                marginBottom: 4,
              }}
              onClick={() => window.history.back()}
            >
              Cancelar
            </button>
          </div>

          {/* Widget Payphone y feedback visual */}
          {!isPresetFreeEntry && (
            <div style={{ width: "100%", marginTop: 24 }}>
              <div id="pp-button" style={{ marginBottom: 16 }}></div>
            </div>
          )}

          {/* CustomAlert para entrada gratuita */}
          <CustomAlert
            visible={showFreeAlert}
            title={
              appliedRedemption
                ? "¡Cupón aplicado exitosamente!"
                : "Entrada gratuita registrada"
            }
            message={
              appliedRedemption
                ? `Tu cupón "${appliedRedemption.code}" fue aplicado correctamente. ¡Acceso gratis confirmado!`
                : "¡Tu acceso fue confirmado!"
            }
            type="success"
            primaryButton={{
              text:
                backendResponse?.noHidden || paymentData.noHidden
                  ? "OK"
                  : "Ir al inicio",
              onPress: () => {
                setShowFreeAlert(false);
                if (!(backendResponse?.noHidden || paymentData.noHidden)) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs", params: { screen: "Home" } }],
                  });
                }
              },
            }}
            onClose={() => {
              setShowFreeAlert(false);
              if (!(backendResponse?.noHidden || paymentData.noHidden)) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs", params: { screen: "Home" } }],
                });
              }
            }}
          />

          {/* CustomAlert para pago exitoso con BeCoins */}
          <CustomAlert
            visible={showPaymentSuccessAlert}
            title="¡Pago exitoso!"
            message={`Tu pago de ${usdToBeCoins(
              Number(amount || 0)
            ).toLocaleString()} BeCoins fue procesado correctamente.`}
            type="success"
            primaryButton={{
              text:
                backendResponse?.noHidden || paymentData.noHidden
                  ? "OK"
                  : "Ir al inicio",
              onPress: () => {
                setShowPaymentSuccessAlert(false);
                if (!(backendResponse?.noHidden || paymentData.noHidden)) {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainTabs", params: { screen: "Home" } }],
                  });
                }
              },
            }}
            onClose={() => {
              setShowPaymentSuccessAlert(false);
              if (!(backendResponse?.noHidden || paymentData.noHidden)) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "MainTabs", params: { screen: "Home" } }],
                });
              }
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PaymentScreen;
