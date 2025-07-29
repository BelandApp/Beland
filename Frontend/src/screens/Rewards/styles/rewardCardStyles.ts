import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const rewardCardStyles = StyleSheet.create({
  rewardsSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  rewardsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
    gap: 8,
  },
  rewardCard: {
    width: "48%",
    padding: 12,
    position: "relative" as const,
    minHeight: 200,
  },
  popularBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: "#FF5722",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold" as const,
  },
  rewardImageContainer: {
    alignItems: "center" as const,
    marginBottom: 12,
  },
  rewardEmoji: {
    fontSize: 40,
  },
  rewardContent: {
    gap: 8,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    textAlign: "center" as const,
  },
  rewardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 16,
  },
  discountBadge: {
    backgroundColor: colors.belandGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "center" as const,
  },
  discountText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold" as const,
  },
  rewardFooter: {
    flexDirection: "column" as const,
    gap: 8,
    marginTop: 8,
  },
  costContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 4,
  },
  costText: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: colors.belandGreen,
  },
  claimButton: {
    backgroundColor: colors.belandGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "stretch" as const,
  },
  claimButtonDisabled: {
    backgroundColor: "#CCCCCC",
  },
  claimButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  claimButtonTextDisabled: {
    color: "#888888",
  },
});
