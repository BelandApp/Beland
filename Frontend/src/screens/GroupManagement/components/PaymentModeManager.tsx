import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Group, PaymentMode, Participant } from "../../../types";
import { useGroupManagement } from "../../../hooks/useGroupManagement";
import { colors } from "../../../styles/colors";
import { formStyles } from "../../../styles/formStyles";
import { PAYMENT_MODE_OPTIONS } from "../../../constants/paymentModes";
import { formatUSDPrice, CURRENCY_CONFIG } from "../../../constants";

interface PaymentModeManagerProps {
  group: Group;
  onGroupUpdated: (updatedGroup: Group) => void;
  isReadOnly?: boolean;
}

export const PaymentModeManager: React.FC<PaymentModeManagerProps> = ({
  group,
  onGroupUpdated,
  isReadOnly = false,
}) => {
  const { updatePaymentMode, updateParticipantCustomAmount, loading, error } =
    useGroupManagement();
  const [selectedPayingUser, setSelectedPayingUser] = useState<string>(
    group.payingUserId || ""
  );
  const [customAmounts, setCustomAmounts] = useState<{ [key: string]: string }>(
    () => {
      const amounts: { [key: string]: string } = {};
      group.participantsList.forEach((participant) => {
        amounts[participant.id] = (participant.customAmount || 0).toString();
      });
      return amounts;
    }
  );

  const handlePaymentModeChange = async (newMode: PaymentMode) => {
    // Para single_payer, primero cambiar el modo para mostrar las opciones
    if (newMode === "single_payer") {
      // Si no hay un pagador seleccionado, solo cambiar el modo
      const updatedGroup = await updatePaymentMode(
        group.id,
        newMode,
        selectedPayingUser || undefined
      );

      if (updatedGroup) {
        onGroupUpdated(updatedGroup);
      }
      return;
    }

    // Para otros modos, proceder normalmente
    const updatedGroup = await updatePaymentMode(group.id, newMode, undefined);

    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const handlePayingUserSelect = async (participantId: string) => {
    setSelectedPayingUser(participantId);

    // Actualizar el grupo con el pagador seleccionado
    const updatedGroup = await updatePaymentMode(
      group.id,
      "single_payer",
      participantId
    );

    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const handleCustomAmountChange = async (
    participantId: string,
    amount: string
  ) => {
    setCustomAmounts((prev) => ({
      ...prev,
      [participantId]: amount,
    }));

    const numericAmount = parseFloat(amount) || 0;
    const updatedGroup = await updateParticipantCustomAmount(
      group.id,
      participantId,
      numericAmount
    );

    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const renderPaymentModeOptions = () => (
    <View style={formStyles.section}>
      <Text style={formStyles.sectionTitle}>Modo de Pago</Text>

      {PAYMENT_MODE_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            formStyles.optionCard,
            group.paymentMode === option.id && formStyles.selectedOptionCard,
            isReadOnly && { opacity: 0.6 },
          ]}
          onPress={() => !isReadOnly && handlePaymentModeChange(option.id)}
          disabled={loading || isReadOnly}
        >
          <View style={formStyles.optionHeader}>
            <View
              style={[
                formStyles.radioButton,
                group.paymentMode === option.id &&
                  formStyles.radioButtonSelected,
              ]}
            >
              {group.paymentMode === option.id && (
                <View style={formStyles.radioButtonInner} />
              )}
            </View>
            <Text
              style={[
                formStyles.optionTitle,
                group.paymentMode === option.id &&
                  formStyles.selectedOptionTitle,
              ]}
            >
              {option.title}
            </Text>
          </View>
          <Text style={formStyles.optionDescription}>{option.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSinglePayerSelector = () => {
    if (group.paymentMode !== "single_payer") return null;

    return (
      <View style={formStyles.section}>
        <Text style={formStyles.sectionTitle}>¿Quién pagará por todo?</Text>

        {group.participantsList.map((participant) => (
          <TouchableOpacity
            key={participant.id}
            style={[
              formStyles.participantOption,
              selectedPayingUser === participant.id &&
                formStyles.selectedParticipantOption,
              isReadOnly && { opacity: 0.6 },
            ]}
            onPress={() =>
              !isReadOnly && handlePayingUserSelect(participant.id)
            }
            disabled={isReadOnly}
          >
            <View
              style={[
                formStyles.radioButton,
                selectedPayingUser === participant.id &&
                  formStyles.radioButtonSelected,
              ]}
            >
              {selectedPayingUser === participant.id && (
                <View style={formStyles.radioButtonInner} />
              )}
            </View>
            <View style={formStyles.participantInfo}>
              <Text style={formStyles.participantName}>{participant.name}</Text>
              <Text style={formStyles.participantEmail}>
                {participant.instagramUsername
                  ? `@${participant.instagramUsername}`
                  : "Sin Instagram"}
              </Text>
            </View>
            {selectedPayingUser === participant.id && (
              <Text style={formStyles.paymentAmount}>
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                {formatUSDPrice(group.totalAmount)}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCustomAmountsManager = () => {
    if (group.paymentMode !== "custom_amounts") return null;

    const totalCustom = Object.values(customAmounts).reduce(
      (sum, amount) => sum + (parseFloat(amount) || 0),
      0
    );
    const isBalanced = Math.abs(totalCustom - group.totalAmount) < 0.01;

    return (
      <View style={formStyles.section}>
        <Text style={formStyles.sectionTitle}>Montos Personalizados</Text>

        <View style={formStyles.balanceInfo}>
          <Text style={formStyles.balanceLabel}>
            Total del grupo: {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
            {formatUSDPrice(group.totalAmount)}
          </Text>
          <Text style={formStyles.balanceLabel}>
            Total asignado: {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
            {formatUSDPrice(totalCustom)}
          </Text>
          <Text
            style={[
              formStyles.balanceStatus,
              isBalanced ? formStyles.balanceOk : formStyles.balanceError,
            ]}
          >
            {isBalanced
              ? "✓ Balanceado"
              : `Diferencia: ${
                  CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL
                }${formatUSDPrice(Math.abs(group.totalAmount - totalCustom))}`}
          </Text>
        </View>

        {group.participantsList.map((participant) => (
          <View key={participant.id} style={formStyles.customAmountRow}>
            <View style={formStyles.participantInfo}>
              <Text style={formStyles.participantName}>{participant.name}</Text>
              <Text style={formStyles.participantEmail}>
                {participant.instagramUsername
                  ? `@${participant.instagramUsername}`
                  : "Sin Instagram"}
              </Text>
            </View>
            <View style={formStyles.amountInputContainer}>
              <Text style={formStyles.currencySymbol}>
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
              </Text>
              <TextInput
                style={[
                  formStyles.amountInput,
                  isReadOnly && { opacity: 0.6, backgroundColor: "#f5f5f5" },
                ]}
                value={customAmounts[participant.id]}
                onChangeText={(value) =>
                  !isReadOnly && handleCustomAmountChange(participant.id, value)
                }
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                editable={!isReadOnly}
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPaymentSummary = () => (
    <View style={formStyles.section}>
      <Text style={formStyles.sectionTitle}>Resumen de Pago</Text>

      <View style={formStyles.summaryCard}>
        <View style={formStyles.summaryRow}>
          <Text style={formStyles.summaryLabel}>Total del pedido:</Text>
          <Text style={formStyles.summaryValue}>
            ${group.totalAmount.toFixed(2)}
          </Text>
        </View>

        <View style={formStyles.summaryRow}>
          <Text style={formStyles.summaryLabel}>Participantes:</Text>
          <Text style={formStyles.summaryValue}>{group.totalParticipants}</Text>
        </View>

        {group.paymentMode === "equal_split" && (
          <View style={formStyles.summaryRow}>
            <Text style={formStyles.summaryLabel}>Por persona:</Text>
            <Text style={formStyles.summaryValue}>
              ${group.costPerPerson.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={[formStyles.summaryRow, formStyles.summaryHighlight]}>
          <Text style={formStyles.summaryLabelHighlight}>Tu parte:</Text>
          <Text style={formStyles.summaryValueHighlight}>
            ${group.myConsumption.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={formStyles.container}>
      {isReadOnly && (
        <View
          style={[
            formStyles.section,
            {
              backgroundColor: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
            },
          ]}
        ></View>
      )}
      {renderPaymentModeOptions()}
      {renderSinglePayerSelector()}
      {renderCustomAmountsManager()}
      {renderPaymentSummary()}

      {error && (
        <View style={formStyles.errorContainer}>
          <Text style={formStyles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};
