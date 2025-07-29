import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { modalStyles } from "../styles";

interface ProductAddedModalProps {
  visible: boolean;
  onContinueAdding: () => void;
  onContinueGroup: () => void;
}

export const ProductAddedModal: React.FC<ProductAddedModalProps> = ({
  visible,
  onContinueAdding,
  onContinueGroup,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={modalStyles.productAddedModalOverlay}>
        <View style={modalStyles.productAddedModalContent}>
          <View style={modalStyles.productAddedIcon}>
            <Text style={modalStyles.productAddedIconText}>✓</Text>
          </View>

          <Text style={modalStyles.productAddedTitle}>¡Producto agregado!</Text>

          <Text style={modalStyles.productAddedSubtitle}>
            Tu producto se ha agregado correctamente al grupo.
          </Text>

          <View style={modalStyles.productAddedActions}>
            <TouchableOpacity
              style={modalStyles.continueAddingButton}
              onPress={onContinueAdding}
            >
              <Text style={modalStyles.continueAddingButtonText}>
                Agregar más productos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={modalStyles.continueGroupButton}
              onPress={onContinueGroup}
            >
              <Text style={modalStyles.continueGroupButtonText}>
                Continuar con el grupo
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
