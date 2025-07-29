import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const formStyles = StyleSheet.create({
  // Input groups
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
  modernTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  modernErrorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 8,
    marginLeft: 52,
  },

  // Location input
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationInput: {
    flex: 1,
  },
  locationInputIcon: {
    marginLeft: 8,
  },
  locationIconText: {
    fontSize: 16,
  },

  // Time input
  timeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeDisplayText: {
    flex: 1,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  placeholderTime: {
    color: "#A0A0A0",
    fontWeight: "400",
  },
  timeInputIcon: {
    marginLeft: 8,
  },
  timeIconText: {
    fontSize: 16,
  },
});
