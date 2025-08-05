import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundWaves from "../../components/ui/BackgroundWaves";
import SocialButtons from "./components/SocialButtons";
import { useAuth } from "../../hooks/AuthContext";
import { styles } from "./styles";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginAsDemo, loginWithEmailPassword, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      const success = await loginWithEmailPassword(email, password);

      if (success) {
        // Eliminamos el Alert aquí porque ya se muestra en AuthContext
        // La navegación se maneja automáticamente por el cambio de estado en App.tsx
      } else {
        Alert.alert("Error", "Credenciales incorrectas");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo completar el inicio de sesión");
      console.error("Login error:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // No mostrar alert adicional, el loading del AuthContext se encarga
      await login();
    } catch (error) {
      Alert.alert(
        "Error de Google Authentication",
        "Hay un problema con la configuración de Auth0. Para el demo, puedes usar el botón 'Acceso Demo' que está abajo.",
        [
          { text: "OK", style: "default" },
          {
            text: "Usar Demo",
            style: "default",
            onPress: () => handleDemoLogin(),
          },
        ]
      );
    }
  };

  const handleDemoLogin = async () => {
    Alert.alert(
      "Demo Login",
      "¿Quieres ingresar como usuario demo para probar todas las funcionalidades?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, ingresar",
          onPress: async () => {
            // Simular delay
            await new Promise((resolve) => setTimeout(resolve, 800));

            // Usar la función del AuthContext
            loginAsDemo();

            Alert.alert(
              "¡Bienvenido!",
              "Has ingresado como usuario demo. ¡Explora todas las funcionalidades!"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <BackgroundWaves />

        {/* 🔹 Contenedor centrado y con ancho máximo */}
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
    </SafeAreaView>
  );
}
