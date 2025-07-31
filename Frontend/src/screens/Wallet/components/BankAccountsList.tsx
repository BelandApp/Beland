import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface BankAccount {
  holder: string;
  idNumber: string;
  bank: string;
  accountNumber: string;
}

interface BankAccountsListProps {
  accounts: BankAccount[];
  onRemove: (index: number) => void;
}

export const BankAccountsList: React.FC<BankAccountsListProps> = ({
  accounts,
  onRemove,
}) => (
  <View>
    <Text style={{ fontWeight: "bold", marginBottom: 8 }}>
      Cuentas bancarias agregadas:
    </Text>
    {accounts.length === 0 && (
      <Text style={{ color: "#888" }}>No has agregado cuentas bancarias.</Text>
    )}
    {accounts.map((acc, idx) => (
      <View
        key={idx}
        style={{
          marginBottom: 10,
          padding: 8,
          backgroundColor: "#f7f7f7",
          borderRadius: 8,
        }}
      >
        <Text>
          {acc.holder} - {acc.bank}
        </Text>
        <Text style={{ fontSize: 12, color: "#888" }}>
          Cuenta: {acc.accountNumber}
        </Text>
        <TouchableOpacity
          onPress={() => onRemove(idx)}
          style={{ marginTop: 4 }}
        >
          <Text style={{ color: "#c00" }}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    ))}
  </View>
);
