interface PayphoneAccountData {
  phone: string;
}
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PaymentAccountForm } from "./PaymentAccountForm";
import { BankAccountsList } from "./BankAccountsList";

interface BankAccountData {
  holder: string;
  idNumber: string;
  bank: string;
  accountNumber: string;
}

interface BankAccountsSectionProps {
  bankAccounts: BankAccountData[];
  bankData: BankAccountData;
  editAccount: boolean;
  onChangeBankData: (data: BankAccountData | PayphoneAccountData) => void;
  onAddBankAccount: () => void;
  onRemoveBankAccount: (idx: number) => void;
}

export const BankAccountsSection: React.FC<BankAccountsSectionProps> = ({
  bankAccounts,
  bankData,
  editAccount,
  onChangeBankData,
  onAddBankAccount,
  onRemoveBankAccount,
}) => (
  <>
    {editAccount && (
      <View
        style={{
          backgroundColor: "#f6f8ff",
          borderRadius: 14,
          padding: 16,
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 16,
            color: "#388e3c",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Datos de cuenta bancaria
        </Text>
        <PaymentAccountForm
          type="bank"
          value={bankData}
          onChange={onChangeBankData}
        />
        <TouchableOpacity
          onPress={onAddBankAccount}
          style={{
            backgroundColor: "#ff9800",
            borderRadius: 8,
            padding: 10,
            marginTop: 8,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Agregar cuenta bancaria
          </Text>
        </TouchableOpacity>
      </View>
    )}
    <BankAccountsList accounts={bankAccounts} onRemove={onRemoveBankAccount} />
  </>
);
