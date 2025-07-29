import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const walletCardStyles = StyleSheet.create({
  walletCard: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  walletContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  walletLeft: {
    flex: 1,
  },
  availableLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  estimatedValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  walletAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
  },
});
