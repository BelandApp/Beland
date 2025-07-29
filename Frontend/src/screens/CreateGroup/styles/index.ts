import { StyleSheet } from "react-native";
import { colors } from "../../../styles/colors";

export const buttonStyles = StyleSheet.create({
  // Botón principal de crear grupo
  modernCreateButton: {
    backgroundColor: colors.belandOrange,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    elevation: 8,
    shadowColor: colors.belandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginTop: 8,
  },
  modernCreateButtonDisabled: {
    backgroundColor: "#D1D5DB",
    elevation: 2,
    shadowOpacity: 0.1,
  },
  createButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  createButtonIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modernCreateButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  modernCreateButtonTextDisabled: {
    color: "#9CA3AF",
  },
});

// Exportamos también un índice para importar todos los estilos fácilmente
export * from "./createGroupStyles";
export * from "./formStyles";
export * from "./participantStyles";
export * from "./productStyles";
export * from "./modalStyles";
