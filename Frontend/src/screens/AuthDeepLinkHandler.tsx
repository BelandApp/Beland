// src/screens/AuthDeepLinkHandler.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useNavigation,
  CommonActions,
  useRoute,
} from "@react-navigation/native";
import { useAuth } from "src/hooks/AuthContext";

export const AuthDeepLinkHandler = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId?: string };
  const { setSession } = useAuth(); // ✅ Asume que tienes una función para establecer la sesión

  useEffect(() => {
    if (userId) {
      // ✅ Aquí, en una aplicación real, usarías el userId para obtener
      // los datos del usuario desde tu backend o Auth0 y establecer la sesión
      // Por ahora, solo simulamos el login y navegamos.
      setSession(userId); // Simula el login

      // Una vez que la sesión está establecida, navega a la pantalla principal
      // y resetea el historial de navegación.
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        })
      );
    } else {
      // Si el deep link no tiene userId, navega de nuevo a la pantalla de inicio
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    }
  }, [userId, navigation, setSession]);

  return (
    <View style={styles.container}>
      <Text>Iniciando sesión...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
