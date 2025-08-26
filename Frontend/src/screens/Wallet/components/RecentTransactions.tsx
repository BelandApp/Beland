import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { TransactionCard } from "./TransactionCard";
import { Transaction } from "../types";
import { recentTransactionsStyles } from "../styles";

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  isLoading = false,
}) => {
  const navigation = useNavigation();

  const handleViewAll = () => {
    navigation.navigate("WalletHistoryScreen" as never);
  };

  if (isLoading) {
    return (
      <View style={recentTransactionsStyles.container}>
        <View style={recentTransactionsStyles.header}>
          <Text style={recentTransactionsStyles.title}>
            Transacciones recientes
          </Text>
        </View>
        <View style={recentTransactionsStyles.loadingContainer}>
          <ActivityIndicator size="small" color="#F88D2A" />
          <Text style={recentTransactionsStyles.loadingText}>Cargando...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={recentTransactionsStyles.container}>
      <View style={recentTransactionsStyles.header}>
        <Text style={recentTransactionsStyles.title}>
          Transacciones recientes
        </Text>
        <TouchableOpacity
          onPress={handleViewAll}
          style={recentTransactionsStyles.viewAllButton}
        >
          <Text style={recentTransactionsStyles.viewAllText}>Ver todo</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={16}
            color="#F88D2A"
          />
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={recentTransactionsStyles.emptyContainer}>
          <MaterialCommunityIcons name="receipt" size={48} color="#ccc" />
          <Text style={recentTransactionsStyles.emptyTitle}>
            Sin transacciones
          </Text>
          <Text style={recentTransactionsStyles.emptyText}>
            Cuando realices transacciones aparecerán aquí
          </Text>
        </View>
      ) : (
        <View style={recentTransactionsStyles.transactionsList}>
          {transactions.slice(0, 3).map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>
      )}
    </View>
  );
};
