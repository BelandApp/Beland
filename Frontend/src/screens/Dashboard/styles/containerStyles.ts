import { StyleSheet, Platform } from "react-native";
import { colors } from "../../../styles/colors";

export const containerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: Platform.OS === "android" ? 96 : 86, // Espacio extra para la nueva barra de navegación
  },
});
