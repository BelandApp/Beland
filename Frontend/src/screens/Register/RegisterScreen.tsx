import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundWaves from "../../components/ui/BackgroundWaves";
import SocialButtons from "../Login/components/SocialButtons";
import { useAuth } from "../../hooks/AuthContext";
import { styles } from "./styles";

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Error", "El email es obligatorio");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert("Error", "Por favor ingresa un email válido");
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Aquí integrarías con tu backend para el registro
      // Por ahora simularemos el registro
      console.log("Registrando usuario:", formData);

      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1500));

      Alert.alert(
        "¡Registro exitoso!",
        "Tu cuenta ha sido creada correctamente",
        [
          {
            text: "Iniciar sesión",
            onPress: () => navigation.navigate("Login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al crear tu cuenta");
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await login(); // Usar el método existente de Google
    } catch (error) {
      Alert.alert("Error", "No se pudo completar el registro con Google");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <BackgroundWaves />

        <View style={styles.container}>
          <Text style={styles.title}>beland</Text>
          <Text style={styles.subtitle}>Crea tu cuenta</Text>

          <TextInput
            placeholder="Nombre completo"
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange("name", value)}
            autoCapitalize="words"
          />

          <TextInput
            placeholder="Correo electrónico"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={formData.email}
            onChangeText={(value) => handleInputChange("email", value)}
          />

          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            secureTextEntry
            value={formData.password}
            onChangeText={(value) => handleInputChange("password", value)}
          />

          <TextInput
            placeholder="Confirmar contraseña"
            style={styles.input}
            secureTextEntry
            value={formData.confirmPassword}
            onChangeText={(value) =>
              handleInputChange("confirmPassword", value)
            }
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O regístrate con</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleRegister}
          >
            <Text style={styles.googleButtonText}>🌐 Continuar con Google</Text>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
