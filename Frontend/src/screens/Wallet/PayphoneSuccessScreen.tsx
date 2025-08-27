import React, { useEffect, useState } from "react";
import { colors } from "../../styles/colors";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { walletService } from "../../services/walletService";
import { useAuth } from "../../hooks/AuthContext";

export default function PayphoneSuccessScreen() {
  const { user } = useAuth();
  const [id, setId] = useState<string | null>(null);
  const [clientTxId, setClientTxId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Pendiente");
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isPayment, setIsPayment] = useState(false); // Solo para lógica interna, no para render
  const [toWalletId, setToWalletId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const clientTxIdParam = params.get("clientTransactionId");
    setId(idParam);
    setClientTxId(clientTxIdParam);

    // Detectar si es pago QR por bandera en localStorage
    const isQrPayment =
      localStorage.getItem("payphone_is_qr_payment") === "true";
    setIsPayment(isQrPayment); // Solo para lógica interna
    setStatus("Pendiente");
    const toWalletId = localStorage.getItem("payphone_to_wallet_id");
    setToWalletId(toWalletId);

    async function confirmarTransaccion() {
      try {
        const jwtToken = localStorage.getItem("auth_token");
        const payphoneToken = localStorage.getItem("payphone_token");
        if (!payphoneToken) {
          setStatus("No se encontró el token de Payphone en localStorage.");
          setLoading(false);
          return;
        }
        // 1. Confirmar la transacción con Payphone
        const payphoneRes = await fetch(
          "https://pay.payphonetodoesposible.com/api/button/V2/Confirm",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${payphoneToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: Number(idParam),
              clientTxId: clientTxIdParam,
            }),
          }
        );
        const payphoneData = await payphoneRes.json();

        if (payphoneData.transactionStatus === "Approved") {
          // Limpiar bandera de pago QR para evitar que quede en true
          localStorage.removeItem("payphone_is_qr_payment");
          localStorage.setItem(
            "payphone_last_success",
            JSON.stringify(payphoneData)
          );

          // 2. Obtener el wallet_id del usuario
          if (!user?.email || !user?.id) {
            return;
          }
          let walletId;
          try {
            const wallet = await walletService.getWalletByUserId(
              user.email,
              user.id
            );
            walletId = wallet?.id;
          } catch (e) {
            setStatus("Transacción rechazada o cancelada");
            setLoading(false);
            return;
          }

          // 3. Realizar pago o recarga en el backend
          const generatedClientTxId = uuidv4();
          const amountUsd = Number(payphoneData.amount) / 100;

          if (isNaN(amountUsd) || amountUsd <= 0) {
            setStatus("El monto recibido de Payphone es inválido.");
            setLoading(false);
            return;
          }
          let backendRes, backendResult;
          if (isPayment && toWalletId) {
            // Pago QR
            const payload = {
              amountUsd,
              referenceCode: payphoneData.reference,
              payphone_transactionId: payphoneData.transactionId,
              clientTransactionId: generatedClientTxId,
              wallet_id: toWalletId,
            };

            backendRes = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/wallets/purchase-recharge/${toWalletId}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
                },
                body: JSON.stringify(payload),
              }
            );
            backendResult = await backendRes.json().catch(() => null);
          } else {
            // Recarga
            const payload = {
              amountUsd,
              referenceCode: payphoneData.reference,
              payphone_transactionId: payphoneData.transactionId,
              clientTransactionId: generatedClientTxId,
            };

            backendRes = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/wallets/recharge`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
                },
                body: JSON.stringify(payload),
              }
            );
            backendResult = await backendRes.json().catch(() => null);
          }

          if (
            backendResult &&
            backendResult.wallet &&
            typeof backendResult.wallet.becoin_balance === "number"
          ) {
            setWalletBalance(backendResult.wallet.becoin_balance);
          }

          if (!backendResult || !backendResult.wallet) {
            let errorMsg = "Transacción rechazada o cancelada";
            if (backendResult && backendResult.message) {
              errorMsg = `Error backend: ${backendResult.message}`;
            } else if (backendResult && backendResult.error) {
              errorMsg = `Error backend: ${backendResult.error}`;
            }
            setStatus(errorMsg);
          }

          // 4. Guardar datos de la tarjeta SOLO si viene ctoken (cardToken)
          if (payphoneData.cardToken) {
            const encryptionKey =
              process.env.EXPO_PUBLIC_PAYPHONE_AES_KEY || "";
            let encryptedCardHolder = "";
            try {
              const key = CryptoJS.enc.Utf8.parse(encryptionKey);
              const encrypted = CryptoJS.AES.encrypt(
                payphoneData.cardHolder || "",
                key,
                { iv: CryptoJS.enc.Utf8.parse("") }
              );
              encryptedCardHolder = encrypted.ciphertext.toString(
                CryptoJS.enc.Base64
              );
            } catch (e) {
              // Error encriptando el nombre del titular
            }

            await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user-cards`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
              },
              body: JSON.stringify({
                user_id: user?.id,
                email: user?.email,
                phoneNumber: payphoneData.phoneNumber,
                documentId: payphoneData.document,
                optionalParameter4: encryptedCardHolder,
                cardBrand: payphoneData.cardBrand,
                cardType: payphoneData.cardType,
                lastDigits: payphoneData.lastDigits,
                cardToken: payphoneData.cardToken,
              }),
            });
          }
          setLoading(false);
          setTimeout(() => {
            setStatus(isPayment ? "Pago exitoso" : "Recarga exitosa");
            setTimeout(() => {
              window.location.href = "/wallet/main";
            }, 1500);
          }, 100);
        } else {
          setStatus("Transacción rechazada o cancelada");
          localStorage.removeItem("payphone_is_qr_payment");
        }
      } finally {
        setLoading(false);
      }
    }

    if (idParam && clientTxIdParam) {
      confirmarTransaccion();
    } else {
      setStatus("Parámetros inválidos en la URL");
      setLoading(false);
    }
  }, [user]);

  const bgGradient = `linear-gradient(135deg, ${colors.belandOrange} 0%, ${colors.primary} 100%)`;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: bgGradient,
        color: colors.textPrimary,
        fontFamily: "Montserrat, Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: colors.cardBackground,
          borderRadius: 32,
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.12)",
          padding: 48,
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
          border: `2px solid ${colors.belandGreen}`,
        }}
      >
        {/* Título principal */}
        {!loading && (
          <>
            {status === "Pago exitoso" && (
              <h2
                style={{
                  fontWeight: 800,
                  marginBottom: 18,
                  fontSize: 28,
                  color: colors.primary,
                }}
              >
                ¡Pago exitoso!
              </h2>
            )}
            {status === "Recarga exitosa" && (
              <h2
                style={{
                  fontWeight: 800,
                  marginBottom: 18,
                  fontSize: 28,
                  color: colors.primary,
                }}
              >
                ¡Recarga exitosa!
              </h2>
            )}
            {status !== "Pago exitoso" && status !== "Recarga exitosa" && (
              <h2
                style={{
                  fontWeight: 800,
                  marginBottom: 18,
                  fontSize: 28,
                  color: colors.error,
                }}
              >
                {status}
              </h2>
            )}
          </>
        )}

        {/* Spinner y mensaje de proceso */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                border: `6px solid ${colors.belandGreen}`,
                borderTop: `6px solid ${colors.belandOrange}`,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                marginBottom: 12,
              }}
            ></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <span
              style={{
                fontSize: 22,
                color: colors.textSecondary,
                fontWeight: 600,
              }}
            >
              Procesando...
            </span>
          </div>
        )}

        {/* Bloque de estado */}
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontWeight: 600, color: colors.belandGreen }}>
            Estado:
          </span>
          <br />
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: loading
                ? colors.textSecondary
                : status === "Pago exitoso"
                ? colors.success
                : status === "Recarga exitosa"
                ? colors.success
                : colors.error,
            }}
          >
            {loading
              ? "Pendiente"
              : status === "Pago exitoso"
              ? "Pago exitoso"
              : status === "Recarga exitosa"
              ? "Recarga exitosa"
              : status}
          </span>
        </div>

        {/* IDs */}
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontWeight: 600, color: colors.belandGreen }}>
            ID de transacción:
          </span>
          <br />
          <span style={{ fontSize: 20, color: colors.textSecondary }}>
            {id ?? "No disponible"}
          </span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <span style={{ fontWeight: 600, color: colors.belandGreen }}>
            Client Transaction ID:
          </span>
          <br />
          <span style={{ fontSize: 20, color: colors.textSecondary }}>
            {clientTxId ?? "No disponible"}
          </span>
        </div>

        {/* Saldo actualizado */}
        {walletBalance !== null && (
          <div
            style={{
              background: colors.belandGreen,
              color: colors.cardBackground,
              borderRadius: 14,
              padding: 18,
              marginBottom: 18,
              fontSize: 20,
              fontWeight: 700,
              boxShadow: "0 2px 8px 0 #A9D19555",
            }}
          >
            <b>Saldo actualizado: {walletBalance} BeCoins</b>
          </div>
        )}
        {status === "Recarga exitosa" && (
          <div
            style={{ marginTop: 18, fontSize: 18, color: colors.belandOrange }}
          >
            Redirigiendo a tu billetera...
          </div>
        )}
      </div>
    </div>
  );
}
