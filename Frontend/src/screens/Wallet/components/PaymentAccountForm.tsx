import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

interface BankAccountData {
  holder: string;
  idNumber: string;
  bank: string;
  accountNumber: string;
}

interface PayphoneAccountData {
  phone: string;
}

interface PaymentAccountFormProps {
  type: "bank" | "payphone";
  value: BankAccountData | PayphoneAccountData;
  onChange: (data: BankAccountData | PayphoneAccountData) => void;
}

export const PaymentAccountForm: React.FC<PaymentAccountFormProps> = ({
  type,
  value,
  onChange,
}) => {
  if (type === "bank") {
    const data = value as BankAccountData;
    return (
      <View style={styles.formBox}>
        <Text style={styles.label}>Titular</Text>
        <TextInput
          style={styles.input}
          value={data.holder}
          onChangeText={(holder) => onChange({ ...data, holder })}
          placeholder="Nombre completo"
        />
        <Text style={styles.label}>Cédula</Text>
        <TextInput
          style={styles.input}
          value={data.idNumber}
          onChangeText={(idNumber) => onChange({ ...data, idNumber })}
          placeholder="Cédula"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Banco</Text>
        <TextInput
          style={styles.input}
          value={data.bank}
          onChangeText={(bank) => onChange({ ...data, bank })}
          placeholder="Banco"
        />
        <Text style={styles.label}>Número de cuenta</Text>
        <TextInput
          style={styles.input}
          value={data.accountNumber}
          onChangeText={(accountNumber) => onChange({ ...data, accountNumber })}
          placeholder="Número de cuenta"
          keyboardType="numeric"
        />
      </View>
    );
  }
  if (type === "payphone") {
    const data = value as PayphoneAccountData;
    return (
      <View style={styles.formBox}>
        <Text style={styles.label}>Número de teléfono</Text>
        <TextInput
          style={styles.input}
          value={data.phone}
          onChangeText={(phone) => onChange({ ...data, phone })}
          placeholder="09xxxxxxxx"
          keyboardType="phone-pad"
        />
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  formBox: {
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    padding: 12,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
    color: "#222",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 8,
    marginBottom: 8,
  },
});
