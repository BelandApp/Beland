import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from "react-native";
import { Button } from "../ui/Button";
import { InstagramSearchInput } from "../ui/InstagramSearchInput";
import { colors } from "../../styles/colors";
import { Participant } from "../../types";
import { InstagramUser } from "../../services/instagramService";

interface AddParticipantModalProps {
  visible: boolean;
  onClose: () => void;
  onAddParticipant: (name: string, instagramUser: InstagramUser) => void;
  errors?: {
    name?: string;
    instagram?: string;
  };
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  visible,
  onClose,
  onAddParticipant,
  errors = {},
}) => {
  const [name, setName] = useState("");
  const [instagramUsername, setInstagramUsername] = useState("");
  const [selectedInstagramUser, setSelectedInstagramUser] =
    useState<InstagramUser | null>(null);
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleValue.setValue(0);
      opacityValue.setValue(0);
      // Limpiar campos al cerrar
      setName("");
      setInstagramUsername("");
      setSelectedInstagramUser(null);
    }
  }, [visible]);

  const handleAdd = () => {
    // Validar que todos los campos requeridos estén completos
    if (!name.trim()) {
      // Si no hay nombre, el error se manejará desde el componente padre
      return;
    }

    // Permitir agregar sin usuario de Instagram
    if (selectedInstagramUser) {
      onAddParticipant(name.trim(), selectedInstagramUser);
    } else {
      // Si no se seleccionó usuario, enviar solo el nombre y el texto de Instagram
      onAddParticipant(name.trim(), {
        username: instagramUsername.trim(),
        profile_pic_url: "",
        full_name: "",
        is_verified: false,
      });
    }
    // Solo cerrar si no hay errores (esto se manejará desde el padre)
  };

  const handleClose = () => {
    setName("");
    setInstagramUsername("");
    setSelectedInstagramUser(null);
    onClose();
  };

  const handleInstagramUserSelect = (user: InstagramUser) => {
    setSelectedInstagramUser(user);
    // Auto-rellenar el nombre si está vacío
    if (!name.trim()) {
      setName(user.full_name);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: opacityValue }]}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ scale: scaleValue }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>👥</Text>
                </View>
                <Text style={styles.title}>Agregar Participante</Text>
                <Text style={styles.subtitle}>
                  Añade a alguien más al grupo
                </Text>
              </View>

              {/* Form */}
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre completo *</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.name && styles.textInputError,
                    ]}
                    placeholder="Ej: María González"
                    value={name}
                    onChangeText={setName}
                    autoFocus
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Instagram *</Text>
                  <InstagramSearchInput
                    value={instagramUsername}
                    onChangeText={setInstagramUsername}
                    onUserSelect={handleInstagramUserSelect}
                    placeholder="@usuario_instagram"
                    error={errors.instagram}
                  />
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <Button
                  title="Cancelar"
                  onPress={handleClose}
                  variant="secondary"
                  style={styles.cancelButton}
                />
                <Button
                  title="Agregar"
                  onPress={handleAdd}
                  variant="primary"
                  style={styles.addButton}
                />
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.belandGreen + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.textSecondary + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.background,
  },
  textInputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  addButton: {
    flex: 1,
  },
});
