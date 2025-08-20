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
  const [status, setStatus] = useState<string>("Procesando...");
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const clientTxIdParam = params.get("clientTransactionId");
    setId(idParam);
    setClientTxId(clientTxIdParam);

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
          setStatus("Recarga confirmada");
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

          // 3. Recargar saldo en el backend SOLO si la transacción fue confirmada
          const generatedClientTxId = uuidv4();
          const rechargeRes = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/wallets/recharge`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
              },
              body: JSON.stringify({
                amountUsd: payphoneData.amount / 100,
                referenceCode: payphoneData.reference,
                payphone_transactionId: payphoneData.transactionId,
                clientTransactionId: generatedClientTxId,
              }),
            }
          );
          const rechargeResult = await rechargeRes.json().catch(() => null);

          if (
            rechargeResult &&
            rechargeResult.wallet &&
            typeof rechargeResult.wallet.becoin_balance === "number"
          ) {
            setWalletBalance(rechargeResult.wallet.becoin_balance);
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

          setStatus("Recarga exitosa");
          setTimeout(() => {
            window.location.href = "/wallet/main";
          }, 2000);
        } else {
          setStatus("Transacción rechazada o cancelada");
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
        {/* Estado visual según status */}
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
              Procesando recarga...
            </span>
            <h2
              style={{
                fontWeight: 800,
                marginBottom: 18,
                fontSize: 28,
                color: colors.primary,
              }}
            >
              Pendiente
            </h2>
          </div>
        )}
        {!loading && status === "Recarga exitosa" && (
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
        {!loading && status === "Transacción rechazada o cancelada" && (
          <h2
            style={{
              fontWeight: 800,
              marginBottom: 18,
              fontSize: 28,
              color: colors.error,
            }}
          >
            Ocurrió un error, intenta nuevamente
          </h2>
        )}

        {/* Estado */}
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
                : status === "Recarga exitosa"
                ? colors.success
                : status === "Transacción rechazada o cancelada"
                ? colors.error
                : colors.textSecondary,
            }}
          >
            {loading
              ? "Pendiente"
              : status === "Recarga exitosa"
              ? "Recarga exitosa"
              : status === "Transacción rechazada o cancelada"
              ? "Error"
              : "Pendiente"}
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
