import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundWaves from "../../components/ui/BackgroundWaves";
import { useAuth } from "../../hooks/AuthContext";
import { styles } from "./styles";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loginAsDemo, loginWithEmailPassword, isLoading } = useAuth();
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }

    // Log de los inputs antes de enviar
    console.log("[LOGIN] Email:", email);
    console.log("[LOGIN] Password:", password);

    try {
      const success = await loginWithEmailPassword(email, password);
      console.log("[LOGIN] Resultado loginWithEmailPassword:", success);
      if (!success) {
        setAlert({
          visible: true,
          title: "Error",
          message: "Credenciales incorrectas",
          type: "error",
        });
      }
      // Si es exitoso, la navegación se maneja por el AuthContext
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "No se pudo completar el inicio de sesión",
        type: "error",
      });
      console.error("[LOGIN] Error en loginWithEmailPassword:", error);
    }
  };

  const handleGoogleLogin = async () => {
    setAlert({
      visible: true,
      title: "Error de Google Authentication",
      message:
        "Hay un problema con la configuración de Auth0. Para el demo, puedes usar el botón 'Acceso Demo' que está abajo.",
      type: "error",
    });
  };

  const handleDemoLogin = async () => {
    setAlert({
      visible: true,
      title: "Demo Login",
      message:
        "¿Quieres ingresar como usuario demo para probar todas las funcionalidades?",
      type: "info",
    });
  };

  // Acción para el botón de demo dentro del CustomAlert
  const handleDemoConfirm = async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    loginAsDemo();
    setAlert({
      visible: true,
      title: "¡Bienvenido!",
      message:
        "Has ingresado como usuario demo. ¡Explora todas las funcionalidades!",
      type: "success",
    });
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
          <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>
          <TextInput
            placeholder="Correo electrónico"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Iniciando sesión..." : "Ingresar"}
            </Text>
          </TouchableOpacity>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O inicia sesión con</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
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
          <TouchableOpacity style={styles.demoButton} onPress={handleDemoLogin}>
            <Text style={styles.demoButtonText}>
              🎯 Acceso Demo (Para pruebas)
            </Text>
          </TouchableOpacity>
          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>
              ¿No tienes una cuenta?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/* CustomAlert para errores y demo */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, visible: false })}
        primaryButton={
          alert.title === "Demo Login"
            ? { text: "Sí, ingresar", onPress: handleDemoConfirm }
            : undefined
        }
        secondaryButton={
          alert.title === "Demo Login"
            ? {
                text: "Cancelar",
                onPress: () => setAlert({ ...alert, visible: false }),
              }
            : undefined
        }
      />
    </SafeAreaView>
  );
}
