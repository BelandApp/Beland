// En un archivo nuevo: src/components/modals/AuthRequiredModal.tsx
import React from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";

interface AuthRequiredModalProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const AuthRequiredModal = ({
  isVisible,
  onCancel,
  onConfirm,
}: AuthRequiredModalProps) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>¡Acceso restringido!</Text>
          <Text style={styles.modalText}>
            Para acceder a esta sección, debes iniciar sesión.
          </Text>
          <View style={styles.buttonContainer}>
            <Button title="Cancelar" onPress={onCancel} color="#888" />
            <Button
              title="Iniciar sesión"
              onPress={onConfirm}
              color="#FF7A00"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
});

export default AuthRequiredModal;
