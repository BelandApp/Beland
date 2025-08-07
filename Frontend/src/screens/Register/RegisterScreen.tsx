import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundWaves from "../../components/ui/BackgroundWaves";
import SocialButtons from "../Login/components/SocialButtons";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { useAuth } from "../../hooks/AuthContext";
import { styles } from "./styles";

export default function RegisterScreen({ navigation }: any) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    registerWithGoogle,
    registerWithEmailPassword,
    isLoading: authLoading,
  } = useAuth();

  // Efecto para navegación automática después del alert
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
        // Limpiar el formulario
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        // Navegar al login
        navigation.navigate("Login");
      }, 2500); // 2.5 segundos

      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert, navigation]);

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

    if (formData.password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return false;
    }

    // Validación de contraseña fuerte según backend
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos:\n• 1 mayúscula\n• 1 minúscula\n• 1 número\n• 1 símbolo (!@#$%^&*)"
      );
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

    try {
      const success = await registerWithEmailPassword(
        formData.name,
        formData.email,
        formData.password
      );

      if (success) {
        // Mostrar alert personalizado en lugar del alert nativo
        setShowSuccessAlert(true);
      } else {
        Alert.alert("Error", "No se pudo crear la cuenta");
      }
    } catch (error: any) {
      console.error("Register error:", error);

      if (error.message === "EMAIL_ALREADY_EXISTS") {
        Alert.alert(
          "Email ya registrado",
          "Ya existe una cuenta con este email. ¿Quieres iniciar sesión en su lugar?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Ir a Login",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else if (error.message === "REGISTRATION_ERROR") {
        Alert.alert(
          "Error de registro",
          "Hubo un problema al crear tu cuenta. Verifica que tu contraseña cumpla con los requisitos."
        );
      } else {
        Alert.alert("Error", "Hubo un problema al crear tu cuenta");
      }
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await registerWithGoogle(); // Usar la nueva función específica para registro
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

          <Text style={styles.passwordHint}>
            La contraseña debe tener: 8-15 caracteres, 1 mayúscula, 1 minúscula,
            1 número y 1 símbolo (!@#$%^&*)
          </Text>

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
            style={[
              styles.button,
              (isLoading || authLoading) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={isLoading || authLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading || authLoading ? "Creando cuenta..." : "Crear cuenta"}
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
            <View style={styles.googleButtonContent}>
              <Image
                source={{
                  uri: "https://developers.google.com/identity/images/g-logo.png",
                }}
                style={styles.googleLogo}
              />
              <Text style={styles.googleButtonText}>Continuar con Google</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CustomAlert para registro exitoso */}
      <CustomAlert
        visible={showSuccessAlert}
        type="success"
        title="¡Registro exitoso!"
        message="Tu cuenta ha sido creada correctamente. Redirigiendo al login..."
        onClose={() => setShowSuccessAlert(false)}
        autoCloseDelay={2500}
      />
    </SafeAreaView>
  );
}
