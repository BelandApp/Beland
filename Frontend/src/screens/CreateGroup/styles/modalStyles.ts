import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const modalStyles = StyleSheet.create({
  // Modal de ubicación
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  // Contenedor de información
  infoContainer: {
    backgroundColor: colors.belandGreen + "10",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.belandGreen + "20",
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: "center",
  },

  // Contenedor de error
  errorContainer: {
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FED7D7",
  },
  errorText: {
    fontSize: 14,
    color: "#E53E3E",
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: "600",
  },
  helpText: {
    fontSize: 13,
    color: "#4A5568",
    lineHeight: 18,
  },
  settingsButton: {
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    alignItems: "center",
  },
  settingsButtonText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "600",
  },

  // Lista de ubicaciones
  locationList: {
    maxHeight: 500,
    padding: 20,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primaryLocationButton: {
    backgroundColor: "rgba(102, 126, 234, 0.15)",
    borderColor: "#667eea",
    borderWidth: 2,
    // elevation: 3,
    // shadowColor: "#667eea",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 8,
  },
  mapSelectorButton: {
    backgroundColor: "rgba(118, 75, 162, 0.25)",
    borderColor: "#764ba2",
    borderWidth: 1.5,
    // elevation: 2,
    // shadowColor: "#764ba2",
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.15,
    // shadowRadius: 6,
  },
  mapButtonSelected: {
    backgroundColor: "rgba(76, 175, 80, 0.15)",
    borderColor: "#4CAF50",
    borderWidth: 2,
    // elevation: 4,
    // shadowColor: "#4CAF50",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.25,
    // shadowRadius: 10,
  },
  mapButtonIcon: {
    fontSize: 24,
    textAlign: "center",
  },
  mapButtonContent: {
    flex: 1,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  mapButtonSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  mapButtonArrow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  locationDivider: {
    alignItems: "center",
    marginVertical: 16,
  },
  locationDividerText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    backgroundColor: "white",
    paddingHorizontal: 16,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "rgba(102, 126, 234, 0.04)",
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(102, 126, 234, 0.1)",
  },
  locationOptionIcon: {
    fontSize: 18,
    marginRight: 16,
  },
  locationOptionText: {
    fontSize: 16,
    color: colors.textPrimary,
    flex: 1,
  },

  // Modal de tiempo
  timeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timeModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "95%",
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  timePickerContainer: {
    padding: 20,
  },
  timeSection: {
    marginBottom: 16,
  },
  timeSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: "center",
  },
  timePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  timePicker: {
    height: 120,
    width: 70,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  timePickerContent: {
    paddingVertical: 8,
  },
  timeOption: {
    minHeight: 32,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  timeOptionSelected: {
    backgroundColor: colors.belandOrange,
  },
  timeOptionText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  timeOptionTextSelected: {
    color: "white",
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginHorizontal: 8,
    alignSelf: "center",
    marginTop: 30,
  },
  timePreview: {
    backgroundColor: colors.belandOrange + "15",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.belandOrange + "30",
  },
  timePreviewLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 8,
  },
  timePreviewText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.belandOrange,
  },
  confirmTimeButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 8,
  },
  confirmTimeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },

  // Nuevos estilos para iconos mejorados
  locationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(102, 126, 234, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  predefinedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(102, 126, 234, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    alignSelf: "center",
  },
  locationOptionArrow: {
    fontSize: 16,
    color: colors.textSecondary,
    opacity: 0.7,
  },
});
