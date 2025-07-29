import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const participantStyles = StyleSheet.create({
  // Card styles
  modernCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.belandOrange + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Input styles
  modernInputGroup: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
    marginTop: 8,
  },
  inputIcon: {
    fontSize: 18,
  },
  inputContent: {
    flex: 1,
  },
  modernInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modernTextInput: {
    fontSize: 16,
    color: colors.textPrimary,
    padding: 0,
    minHeight: 24,
  },
  modernErrorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 8,
    marginLeft: 52,
  },

  // Usuario actual
  currentUserContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.belandOrange + "10",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.belandOrange + "30",
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.belandOrange,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  participantRole: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  participantEmail: {
    fontSize: 12,
    color: colors.belandOrange,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },

  // Lista de participantes
  modernParticipantItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  modernRemoveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  modernRemoveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  // Agregar participante
  addParticipantSection: {
    marginTop: 8,
    padding: 20,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  addParticipantHeader: {
    marginBottom: 20,
  },
  addParticipantTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  addParticipantSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addParticipantButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.belandOrange,
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
    elevation: 4,
    shadowColor: colors.belandOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  addParticipantButtonIcon: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
    marginRight: 8,
  },
  addParticipantButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
