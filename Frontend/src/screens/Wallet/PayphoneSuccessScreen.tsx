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
        // Obtener el token JWT del usuario (web)
        const jwtToken = localStorage.getItem("auth_token");
        // Obtener el token de Payphone guardado en localStorage
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
          console.log(
            "[Payphone] Transacción aprobada, iniciando proceso de recarga..."
          );
          setStatus("Recarga confirmada");
          // Guardar los datos completos en localStorage y mostrar en consola
          localStorage.setItem(
            "payphone_last_success",
            JSON.stringify(payphoneData)
          );
          console.log(
            "[Payphone] Datos de la transacción exitosa:",
            payphoneData
          );

          // 2. Obtener el wallet_id del usuario
          let walletId;
          if (!user?.email || !user?.id) {
            console.error(
              "[Payphone] Faltan datos de usuario (email o id)",
              user
            );
            setStatus("Faltan datos de usuario (email o id)");
            setLoading(false);
            return;
          }
          try {
            console.log(
              "[Payphone] Buscando wallet del usuario...",
              user.email,
              user.id
            );
            const wallet = await walletService.getWalletByUserId(
              user.email,
              user.id
            );
            walletId = wallet?.id;
            console.log("[Payphone] Wallet encontrada:", walletId);
          } catch (e) {
            console.error(
              "[Payphone] Error al obtener la wallet del usuario",
              e
            );
            setStatus("No se pudo obtener la wallet del usuario");
            setLoading(false);
            return;
          }

          // 3. Recargar saldo en el backend SOLO si la transacción fue confirmada

          // Generar UUID para clientTransactionId
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
                amountUsd: payphoneData.amount / 100, // en USD
                wallet_id: walletId,
                referenceCode: payphoneData.reference, // o genera uno único
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
            // Encriptar el nombre del titular usando AES 256 CBC sin IV
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
              console.warn("Error encriptando el nombre del titular:", e);
            }

            console.log("[Payphone] Guardando datos de tarjeta en backend...", {
              user_id: user?.id,
              email: user?.email,
              phoneNumber: payphoneData.phoneNumber,
              documentId: payphoneData.document,
              optionalParameter4: encryptedCardHolder,
              cardBrand: payphoneData.cardBrand,
              cardType: payphoneData.cardType,
              lastDigits: payphoneData.lastDigits,
              cardToken: payphoneData.cardToken,
            });
            const cardRes = await fetch(
              `${process.env.EXPO_PUBLIC_API_URL}/user-cards`,
              {
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
                  optionalParameter4: encryptedCardHolder, // nombre encriptado
                  cardBrand: payphoneData.cardBrand,
                  cardType: payphoneData.cardType,
                  lastDigits: payphoneData.lastDigits,
                  cardToken: payphoneData.cardToken,
                }),
              }
            );
            const cardResult = await cardRes.json().catch(() => null);
            console.log(
              "[Payphone] Respuesta guardado tarjeta backend:",
              cardRes.status,
              cardResult
            );
          } else {
            console.log(
              "[Payphone] No se recibió cardToken, no se guarda la tarjeta"
            );
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

  // Colores oficiales Beland
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
        <img
          src="https://payphone.com.ec/wp-content/uploads/2022/09/payphone-logo.png"
          alt="Payphone Logo"
          style={{
            width: 90,
            marginBottom: 28,
            filter: "drop-shadow(0 2px 8px #00C6AE)",
          }}
        />
        <h2
          style={{
            fontWeight: 800,
            marginBottom: 18,
            fontSize: 28,
            color: colors.primary,
          }}
        >
          {status === "Recarga exitosa"
            ? "¡Recarga exitosa!"
            : "Procesando recarga..."}
        </h2>
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
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontWeight: 600, color: colors.belandGreen }}>
            Estado:
          </span>
          <br />
          <span style={{ fontSize: 22, color: colors.success }}>
            {loading ? "Procesando..." : status}
          </span>
        </div>
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
