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
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
    onClose?: () => void;
    primaryButton?: { text: string; onPress: () => void };
    secondaryButton?: { text: string; onPress: () => void };
  }>({ visible: false, title: "", message: "" });
  const { registerWithEmailPassword, isLoading: authLoading } = useAuth();

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
      setAlert({
        visible: true,
        title: "Error",
        message: "El nombre es obligatorio",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
      return false;
    }
    if (!formData.email.trim()) {
      setAlert({
        visible: true,
        title: "Error",
        message: "El email es obligatorio",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor ingresa un email válido",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
      return false;
    }
    if (formData.password.length < 8) {
      setAlert({
        visible: true,
        title: "Error",
        message: "La contraseña debe tener al menos 8 caracteres",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
      return false;
    }
    // Validación de contraseña fuerte según backend
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[!@#$%^&*]/.test(formData.password);
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setAlert({
        visible: true,
        title: "Error",
        message:
          "La contraseña debe tener al menos:\n• 1 mayúscula\n• 1 minúscula\n• 1 número\n• 1 símbolo (!@#$%^&*)",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Las contraseñas no coinciden",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const result = await registerWithEmailPassword(
      formData.name,
      formData.email,
      formData.password
    );

    if (result === true) {
      setShowSuccessAlert(true);
    } else if (result === "EMAIL_ALREADY_EXISTS") {
      setAlert({
        visible: true,
        title: "Email ya registrado",
        message:
          "Ya existe una cuenta con este email. ¿Quieres iniciar sesión en su lugar?",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
        primaryButton: {
          text: "Ir a Login",
          onPress: () => {
            setAlert((a) => ({ ...a, visible: false }));
            navigation.navigate("Login");
          },
        },
        secondaryButton: {
          text: "Cancelar",
          onPress: () => setAlert((a) => ({ ...a, visible: false })),
        },
      });
    } else if (result === "REGISTRATION_LOGIN_ERROR") {
      setAlert({
        visible: true,
        title: "Error tras registro",
        message:
          "El usuario fue creado pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
    } else if (result === "NETWORK_ERROR") {
      setAlert({
        visible: true,
        title: "Error de conexión",
        message:
          "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
    } else {
      setAlert({
        visible: true,
        title: "Error",
        message: "Hubo un problema al crear tu cuenta",
        type: "error",
        onClose: () => setAlert((a) => ({ ...a, visible: false })),
      });
    }
  };

  const handleGoogleRegister = async () => {
    // Google registration is no longer supported
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
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={
          alert.onClose || (() => setAlert((a) => ({ ...a, visible: false })))
        }
        primaryButton={alert.primaryButton}
        secondaryButton={alert.secondaryButton}
      />
    </SafeAreaView>
  );
}
