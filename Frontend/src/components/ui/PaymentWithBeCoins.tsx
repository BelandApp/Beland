import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";
import { BeCoinsBalance } from "./BeCoinsBalance";
import {
  convertUSDToBeCoins,
  convertBeCoinsToUSD,
  formatUSDPrice,
  formatBeCoins,
  BECOIN_CONFIG,
} from "../../constants";
import { colors } from "../../styles/colors";

interface PaymentWithBeCoinsProps {
  usdAmount: number;
  description: string;
  onPaymentSuccess: (
    paymentMethod: "becoins" | "traditional",
    amountPaid: number
  ) => void;
  onCancel?: () => void;
  allowPartialPayment?: boolean;
  relatedId?: string;
}

export const PaymentWithBeCoins: React.FC<PaymentWithBeCoinsProps> = ({
  usdAmount,
  description,
  onPaymentSuccess,
  onCancel,
  allowPartialPayment = false,
  relatedId,
}) => {
  const { balance, hasEnoughBeCoins, payWithBeCoins, getBeCoinsInUSD } =
    useBeCoinsStore();
  const [paymentMode, setPaymentMode] = useState<
    "full" | "partial" | "traditional"
  >("full");

  const beCoinsNeeded = convertUSDToBeCoins(usdAmount);
  const canPayFull = hasEnoughBeCoins(beCoinsNeeded);
  const maxPayableUSD = getBeCoinsInUSD();
  const maxPayableBeCoins = balance;

  const handlePayment = () => {
    switch (paymentMode) {
      case "full":
        if (payWithBeCoins(usdAmount, description, relatedId)) {
          onPaymentSuccess("becoins", usdAmount);
        } else {
          Alert.alert("Error", "No tienes suficientes BeCoins para este pago");
        }
        break;

      case "partial":
        if (maxPayableBeCoins > 0) {
          const actualPaidUSD = maxPayableUSD;
          if (
            payWithBeCoins(
              actualPaidUSD,
              `${description} (pago parcial)`,
              relatedId
            )
          ) {
            onPaymentSuccess("becoins", actualPaidUSD);
          }
        }
        break;

      case "traditional":
        onPaymentSuccess("traditional", usdAmount);
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Opciones de Pago</Text>
        <Text style={styles.amount}>Total: ${formatUSDPrice(usdAmount)}</Text>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Tu balance actual:</Text>
        <BeCoinsBalance size="large" />
      </View>

      <View style={styles.optionsContainer}>
        {/* Opción: Pago completo con BeCoins */}
        <TouchableOpacity
          style={[
            styles.option,
            paymentMode === "full" && styles.selectedOption,
            !canPayFull && styles.disabledOption,
          ]}
          onPress={() => canPayFull && setPaymentMode("full")}
          disabled={!canPayFull}
        >
          <View style={styles.optionHeader}>
            <Text
              style={[styles.optionTitle, !canPayFull && styles.disabledText]}
            >
              {BECOIN_CONFIG.SYMBOL} Pagar con BeCoins
            </Text>
            {!canPayFull && (
              <Text style={styles.insufficientText}>Insuficiente</Text>
            )}
          </View>
          <Text
            style={[
              styles.optionDescription,
              !canPayFull && styles.disabledText,
            ]}
          >
            {formatBeCoins(beCoinsNeeded)} ({formatUSDPrice(usdAmount)} USD)
          </Text>
          {!canPayFull && (
            <Text style={styles.needMoreText}>
              Necesitas {formatBeCoins(beCoinsNeeded - balance)} más
            </Text>
          )}
        </TouchableOpacity>

        {/* Opción: Pago parcial con BeCoins */}
        {allowPartialPayment && balance > 0 && !canPayFull && (
          <TouchableOpacity
            style={[
              styles.option,
              paymentMode === "partial" && styles.selectedOption,
            ]}
            onPress={() => setPaymentMode("partial")}
          >
            <Text style={styles.optionTitle}>
              {BECOIN_CONFIG.SYMBOL} Pago Parcial con BeCoins
            </Text>
            <Text style={styles.optionDescription}>
              Usar {formatBeCoins(balance)} (${formatUSDPrice(maxPayableUSD)})
            </Text>
            <Text style={styles.remainingText}>
              Restante: ${formatUSDPrice(usdAmount - maxPayableUSD)} por otros
              medios
            </Text>
          </TouchableOpacity>
        )}

        {/* Opción: Pago tradicional */}
        <TouchableOpacity
          style={[
            styles.option,
            paymentMode === "traditional" && styles.selectedOption,
          ]}
          onPress={() => setPaymentMode("traditional")}
        >
          <Text style={styles.optionTitle}>💳 Pago Tradicional</Text>
          <Text style={styles.optionDescription}>
            Pagar ${formatUSDPrice(usdAmount)} con transferencia o efectivo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.payButton, !paymentMode && styles.disabledButton]}
          onPress={handlePayment}
          disabled={!paymentMode}
        >
          <Text style={styles.payButtonText}>
            {paymentMode === "full"
              ? `Pagar ${formatBeCoins(beCoinsNeeded)}`
              : paymentMode === "partial"
              ? `Pagar ${formatBeCoins(balance)} (Parcial)`
              : "Continuar con Pago Tradicional"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.belandOrange,
  },
  balanceContainer: {
    alignItems: "center" as const,
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500" as const,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  option: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "rgba(248, 141, 42, 0.1)",
    borderColor: colors.belandOrange,
  },
  disabledOption: {
    backgroundColor: "#F1F3F4",
    opacity: 0.6,
  },
  optionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  insufficientText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "600" as const,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  needMoreText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  remainingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  disabledText: {
    color: "#9CA3AF",
  },
  buttonContainer: {
    flexDirection: "row" as const,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  payButton: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  disabledButton: {
    backgroundColor: "#D1D5DB",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "white",
  },
};
