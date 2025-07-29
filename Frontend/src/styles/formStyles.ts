import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  // Inputs básicos
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addParticipantContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  createButtonContainer: {
    marginTop: 16,
    marginBottom: 32,
  },

  // Secciones y títulos
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },

  // Opciones y tarjetas
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F1F3F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedOptionCard: {
    borderColor: colors.belandOrange,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginLeft: 16,
    letterSpacing: -0.3,
  },
  selectedOptionTitle: {
    color: colors.belandOrange,
  },
  optionDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginLeft: 36,
    fontWeight: "400",
  },

  // Radio buttons
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: colors.belandOrange,
    backgroundColor: colors.belandOrange,
    shadowColor: colors.belandOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  // Participantes
  participantOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F1F3F4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedParticipantOption: {
    borderColor: colors.belandOrange,
    backgroundColor: colors.belandOrange + "08",
    shadowColor: colors.belandOrange,
    shadowOpacity: 0.12,
    elevation: 4,
  },
  participantInfo: {
    flex: 1,
    marginLeft: 16,
  },
  participantName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  participantEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.belandOrange,
    letterSpacing: -0.3,
  },

  // Montos personalizados
  balanceInfo: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  balanceLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  balanceStatus: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
    letterSpacing: -0.2,
  },
  balanceOk: {
    color: "#10B981",
  },
  balanceError: {
    color: "#EF4444",
  },
  customAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    paddingHorizontal: 8,
  },
  currencySymbol: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 4,
  },
  amountInput: {
    fontSize: 16,
    color: colors.textPrimary,
    minWidth: 60,
    paddingVertical: 8,
    textAlign: "right",
  },

  // Resumen de pago
  summaryCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  summaryHighlight: {
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  summaryLabelHighlight: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  summaryValueHighlight: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },

  // Errores
  errorContainer: {
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  readOnlyNotice: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
