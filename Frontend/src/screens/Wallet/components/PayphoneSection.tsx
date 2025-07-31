interface BankAccountData {
  holder: string;
  idNumber: string;
  bank: string;
  accountNumber: string;
}
import React from "react";
import { View, Text } from "react-native";
import { PaymentAccountForm } from "./PaymentAccountForm";

interface PayphoneAccountData {
  phone: string;
}

interface PayphoneSectionProps {
  payphoneData: PayphoneAccountData;
  editAccount: boolean;
  onChangePayphoneData: (data: BankAccountData | PayphoneAccountData) => void;
}

export const PayphoneSection: React.FC<PayphoneSectionProps> = ({
  payphoneData,
  editAccount,
  onChangePayphoneData,
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
            color: "#6610f2",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Datos de PayPhone
        </Text>
        <PaymentAccountForm
          type="payphone"
          value={payphoneData}
          onChange={onChangePayphoneData}
        />
      </View>
    )}
  </>
);
