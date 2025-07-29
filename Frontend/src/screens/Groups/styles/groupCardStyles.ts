import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const groupCardStyles = StyleSheet.create({
  groupsList: {
    gap: 12,
  },
  groupCard: {
    marginBottom: 4,
  },
  cardContent: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  groupTitleContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500" as const,
  },
  groupInfo: {
    gap: 4,
    marginBottom: 12,
  },
  participants: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  location: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deliveryTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  amountInfo: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  totalAmount: {
    alignItems: "flex-start" as const,
  },
  myAmount: {
    alignItems: "flex-end" as const,
  },
  amountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  myAmountLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
  },
  myAmountValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.belandOrange,
  },
  productsList: {
    marginBottom: 12,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  moreProducts: {
    fontSize: 13,
    color: colors.belandOrange,
    fontStyle: "italic" as const,
  },
  emptyState: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
});
