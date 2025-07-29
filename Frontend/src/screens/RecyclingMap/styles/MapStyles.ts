import { StyleSheet } from "react-native";
import { colors } from "@styles/colors";

export const styles = StyleSheet.create({
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
  },
  mapInfo: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 10,
  },
  mapInfoText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textSecondary,
  },
});
