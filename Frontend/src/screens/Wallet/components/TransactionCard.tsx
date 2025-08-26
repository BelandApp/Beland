import React from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Transaction } from "../types";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";

interface TransactionCardProps {
  transaction: Transaction;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
}) => {
  const getTransactionIcon = () => {
    // Si es transferencia recibida, mostrar icono de entrada
    if (transaction.type === "receive") return "arrow-down-left";
    if (transaction.type === "transfer") return "arrow-up-right";
    if (transaction.type === "recharge") return "plus-circle";
    if (transaction.type === "exchange") return "swap-horizontal";
    if (transaction.type === "payment") return "credit-card-minus";
    if (transaction.type === "collection") return "cash-plus";
    return "help-circle";
  };

  const getTransactionColor = () => {
    // Si es transferencia recibida, mostrar verde
    if (transaction.type === "receive" || transaction.type === "collection")
      return "#4caf50";
    if (transaction.type === "transfer" || transaction.type === "payment")
      return "#f44336";
    if (transaction.type === "recharge") return "#2196f3";
    if (transaction.type === "exchange") return "#ff9800";
    return "#666";
  };

  const getAmountPrefix = () => {
    // Si es transferencia recibida, mostrar '+'
    if (
      transaction.type === "receive" ||
      transaction.type === "collection" ||
      transaction.type === "recharge"
    )
      return "+";
    if (transaction.type === "transfer" || transaction.type === "payment")
      return "-";
    return "";
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "completed":
        return "#4caf50";
      case "pending":
        return "#ff9800";
      case "failed":
        return "#f44336";
      default:
        return "#666";
    }
  };

  // Forzar monto positivo para transferencias recibidas
  const displayAmount =
    transaction.type === "receive" || transaction.type === "collection"
      ? Math.abs(transaction.amount_beicon)
      : transaction.amount_beicon;

  return (
    <Card style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${getTransactionColor()}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={getTransactionIcon() as any}
              size={20}
              color={getTransactionColor()}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.description} numberOfLines={1}>
              {transaction.description}
            </Text>
            <Text style={styles.date}>{transaction.date}</Text>
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.amountContainer}>
            <BeCoinIcon width={16} height={16} />
            <Text style={[styles.amount, { color: getTransactionColor() }]}>
              {getAmountPrefix()}
              {String(Math.abs(displayAmount))}
            </Text>
          </View>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor() },
            ]}
          />
        </View>
      </View>
    </Card>
  );
};

const styles = {
  container: {
    marginBottom: 8,
    padding: 12,
  },
  content: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  leftSection: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#333",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#666",
  },
  rightSection: {
    alignItems: "flex-end" as const,
  },
  amountContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600" as const,
    marginLeft: 4,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
};
