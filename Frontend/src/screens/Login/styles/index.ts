import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: 420, // 🔹 Máximo ancho del formulario en web
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 20,
    borderRadius: 12,
    elevation: 3, // sombra en Android
    shadowColor: "#000", // sombra en iOS y Web
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: "#FF7C1F",
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#FF7C1F",
    width: "90%",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
