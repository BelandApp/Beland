import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const tabStyles = StyleSheet.create({
  tabsContainer: {
    flexDirection: "row" as const,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  activeTab: {
    backgroundColor: colors.belandOrange,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: "#FFFFFF",
  },
});
