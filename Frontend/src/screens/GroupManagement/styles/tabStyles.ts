import { colors } from "../../../styles/colors";

export const tabStyles = {
  // Tabs
  tabOuterContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row" as const,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center" as const,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabButtonContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  activeTabButtonText: {
    color: "white",
    fontWeight: "700" as const,
  },
};
