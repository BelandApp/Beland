import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { Group, PaymentMode, Participant } from "../../types";
import { useGroupManagement } from "../../hooks/useGroupManagement";
import { colors } from "../../styles/colors";
import { formStyles } from "../../styles/formStyles";

// Importaciones de las nuevas utilidades
import { PAYMENT_MODE_OPTIONS } from "../../constants/paymentModes";
import {
  validateCustomAmounts,
  calculateCustomAmountsTotal,
  validateAmount,
  formatAmount,
} from "../../business/validation/paymentValidation";
import {
  formatUSDPrice,
  CURRENCY_CONFIG,
  convertUSDToBeCoins,
  formatBeCoins,
} from "../../constants";
import { BeCoinsBalance, PaymentWithBeCoins } from "../ui";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";

interface PaymentModeManagerProps {
  group: Group;
  onGroupUpdated: (updatedGroup: Group) => void;
  isReadOnly?: boolean;
}

interface PaymentModeOption {
  id: PaymentMode;
  title: string;
  description: string;
}

export const PaymentModeManager: React.FC<PaymentModeManagerProps> = ({
  group,
  onGroupUpdated,
  isReadOnly = false,
}) => {
  const { updatePaymentMode, updateParticipantCustomAmount, loading, error } =
    useGroupManagement();
  const { hasEnoughBeCoins, payWithBeCoins, getBeCoinsInUSD } =
    useBeCoinsStore();

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
  const [showBeCoinsPayment, setShowBeCoinsPayment] = useState(false);
  const [paymentForUser, setPaymentForUser] = useState<{
    userId: string;
    amount: number;
    userName: string;
  } | null>(null);

  // Función para manejar pago con BeCoins
  const handleBeCoinsPayment = (participant: Participant) => {
    const amount =
      group.paymentMode === "equal_split"
        ? group.costPerPerson
        : parseFloat(customAmounts[participant.id]) || 0;

    setPaymentForUser({
      userId: participant.id,
      amount: amount,
      userName: participant.name,
    });
    setShowBeCoinsPayment(true);
  };

  const handlePaymentSuccess = (
    paymentMethod: "becoins" | "traditional",
    amountPaid: number
  ) => {
    if (paymentForUser) {
      // Aquí podrías actualizar el estado del grupo para marcar como pagado
      Alert.alert(
        "Pago Exitoso",
        `${paymentForUser.userName} ha pagado ${formatUSDPrice(amountPaid)} ${
          paymentMethod === "becoins" ? "con BeCoins" : "de forma tradicional"
        }`
      );
    }
    setShowBeCoinsPayment(false);
    setPaymentForUser(null);
  };

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
    } else {
      // Para otros modos, cambiar directamente
      const updatedGroup = await updatePaymentMode(group.id, newMode);
      if (updatedGroup) {
        onGroupUpdated(updatedGroup);
      }
    }
  };

  const handlePayingUserSelect = async (userId: string) => {
    setSelectedPayingUser(userId);

    // Actualizar inmediatamente el grupo con el nuevo pagador
    const updatedGroup = await updatePaymentMode(
      group.id,
      "single_payer",
      userId
    );
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const handleCustomAmountChange = (participantId: string, amount: string) => {
    const cleanAmount = amount.replace(/[^0-9.]/g, "");
    setCustomAmounts((prev) => ({
      ...prev,
      [participantId]: cleanAmount,
    }));
  };

  const saveCustomAmount = async (participantId: string) => {
    const amountString = customAmounts[participantId];
    const amount = parseFloat(amountString) || 0;

    if (!validateAmount(amountString) || amount <= 0) {
      Alert.alert("Error", "El monto debe ser mayor a 0");
      return;
    }

    const updatedGroup = await updateParticipantCustomAmount(
      group.id,
      participantId,
      amount
    );
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const renderPaymentModeOptions = () => {
    return (
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
            disabled={isReadOnly}
          >
            <View style={formStyles.optionHeader}>
              <View
                style={[
                  formStyles.radioButton,
                  group.paymentMode === option.id &&
                    formStyles.radioButtonSelected,
                ]}
              />
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
            <Text style={formStyles.optionDescription}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

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
            />
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

        {/* Botón para pagar con BeCoins si hay un usuario seleccionado */}
        {selectedPayingUser && !isReadOnly && (
          <View style={styles.beCoinsSection}>
            <BeCoinsBalance size="medium" style={{ marginBottom: 12 }} />
            <TouchableOpacity
              style={styles.beCoinsPayButton}
              onPress={() => {
                const payingUser = group.participantsList.find(
                  (p) => p.id === selectedPayingUser
                );
                if (payingUser) {
                  handleBeCoinsPayment(payingUser);
                }
              }}
            >
              <Text style={styles.beCoinsPayButtonText}>
                💰 Pagar con BeCoins (
                {formatBeCoins(convertUSDToBeCoins(group.totalAmount))})
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
              {
                color: isBalanced ? colors.success : colors.error,
              },
            ]}
          >
            {isBalanced
              ? "✓ Los montos están balanceados"
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
                  isReadOnly && { backgroundColor: "#f5f5f5" },
                ]}
                value={customAmounts[participant.id]}
                onChangeText={(text) =>
                  handleCustomAmountChange(participant.id, text)
                }
                onBlur={() => saveCustomAmount(participant.id)}
                placeholder="0.00"
                keyboardType="numeric"
                editable={!isReadOnly}
              />

              {/* Botón para pagar con BeCoins */}
              {!isReadOnly && (
                <TouchableOpacity
                  style={styles.miniBeCoinsButton}
                  onPress={() => handleBeCoinsPayment(participant)}
                >
                  <Text style={styles.miniBeCoinsButtonText}>🪙</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderPaymentSummary = () => {
    return (
      <View style={formStyles.section}>
        <Text style={formStyles.sectionTitle}>Resumen de Pago</Text>

        <View style={formStyles.summaryCard}>
          <View style={formStyles.summaryRow}>
            <Text style={formStyles.summaryLabel}>Total del grupo:</Text>
            <Text style={formStyles.summaryValue}>
              {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
              {formatUSDPrice(group.totalAmount)}
            </Text>
          </View>

          {group.paymentMode === "equal_split" && (
            <View style={formStyles.summaryRow}>
              <Text style={formStyles.summaryLabel}>Por persona:</Text>
              <Text style={formStyles.summaryValue}>
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                {formatUSDPrice(group.costPerPerson)}
              </Text>
            </View>
          )}

          <View style={formStyles.summaryRow}>
            <Text style={formStyles.summaryLabel}>Participantes:</Text>
            <Text style={formStyles.summaryValue}>
              {group.participantsList.length}
            </Text>
          </View>

          <View style={formStyles.summaryRow}>
            <Text style={formStyles.summaryLabel}>Modo de pago:</Text>
            <Text style={formStyles.summaryValue}>
              {
                PAYMENT_MODE_OPTIONS.find((opt) => opt.id === group.paymentMode)
                  ?.title
              }
            </Text>
          </View>

          {/* Mostrar balance de BeCoins en el resumen */}
          <View style={formStyles.summaryRow}>
            <Text style={formStyles.summaryLabel}>Tu balance:</Text>
            <BeCoinsBalance size="small" />
          </View>
        </View>
      </View>
    );
  };

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
        >
          <Text style={formStyles.readOnlyNotice}>
            Este grupo está en modo solo lectura
          </Text>
        </View>
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

      {/* Modal de pago con BeCoins */}
      <Modal
        visible={showBeCoinsPayment}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowBeCoinsPayment(false);
          setPaymentForUser(null);
        }}
      >
        <View style={styles.modalOverlay}>
          {paymentForUser && (
            <PaymentWithBeCoins
              usdAmount={paymentForUser.amount}
              description={`Pago de ${paymentForUser.userName} en grupo ${group.name}`}
              onPaymentSuccess={handlePaymentSuccess}
              onCancel={() => {
                setShowBeCoinsPayment(false);
                setPaymentForUser(null);
              }}
              allowPartialPayment={true}
              relatedId={group.id}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  beCoinsSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "rgba(248, 141, 42, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(248, 141, 42, 0.2)",
  },
  beCoinsPayButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center" as const,
  },
  beCoinsPayButtonText: {
    color: "white",
    fontWeight: "600" as const,
    fontSize: 14,
  },
  miniBeCoinsButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginLeft: 8,
  },
  miniBeCoinsButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
};
