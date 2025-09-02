import { StyleSheet, Platform } from "react-native";
import { colors } from "../../styles/colors";

export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export const headerStyles = StyleSheet.create({
  titleContainer: {
    backgroundColor: colors.belandOrange,
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 30,
    paddingTop: Platform.OS === "android" ? 20 : 50,
    paddingBottom: 24,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.background,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.background,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.9,
  },
});

export const categoryStyles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: colors.background,
  },
});

export const gridStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  resourceCard: {
    width: "48%",
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  resourceImage: {
    width: "100%",
    height: 120,
    backgroundColor: colors.belandGreenLight,
  },
  resourceContent: {
    padding: 12,
  },
  resourceName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  resourcePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 8,
  },
  resourceStock: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  purchaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  purchaseButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "600",
  },
  purchaseButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
});
