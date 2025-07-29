import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const modalStyles = StyleSheet.create({
  // Modal base
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 34, // Para el safe area en iPhone
    minHeight: 300,
  },
  modalHeader: {
    alignItems: "center" as const,
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center" as const,
  },
  modalOptions: {
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: "row" as const,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.belandOrange,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  optionIconText: {
    fontSize: 20,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  // Product added modal
  productAddedModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  productAddedModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    alignItems: "center" as const,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    transform: [{ scale: 1 }],
  },
  productAddedIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.belandGreen + "15",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.belandGreen + "30",
  },
  productAddedIconText: {
    fontSize: 28,
  },
  productAddedTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  productAddedSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center" as const,
    marginBottom: 24,
    lineHeight: 22,
  },
  productAddedActions: {
    width: "100%" as const,
    gap: 12,
  },
  continueAddingButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: colors.belandOrange,
  },
  continueAddingButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.belandOrange,
  },
  continueGroupButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center" as const,
  },
  continueGroupButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "white",
  },
});
