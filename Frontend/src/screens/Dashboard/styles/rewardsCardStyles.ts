import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const rewardsCardStyles = StyleSheet.create({
  rewardsCard: {
    padding: 16,
  },
  rewardsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rewardsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#BBDEFB",
    justifyContent: "center",
    alignItems: "center",
  },
  rewardsText: {
    flex: 1,
  },
  rewardsTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  rewardsSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hotBadge: {
    backgroundColor: "#FF5722",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
});
