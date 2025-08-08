import React, { useRef, useState, useEffect } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { useBeCoinsStoreHydration } from "./src/stores/useBeCoinsStore";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import { setStatusBarHidden } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackNavigator } from "./src/components/layout/RootStackNavigator";
import { AuthStackNavigator } from "./src/components/layout/AuthStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { colors } from "./src/styles/colors";
import { AuthProvider, useAuth } from "src/hooks/AuthContext";

// Componente interno que tiene acceso al contexto de autenticación
const AppContent = () => {
  const { user } = useAuth();
  const isBeCoinsLoaded = useBeCoinsStoreHydration();

  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );

  // Configurar la barra de navegación y estado para Android
  useEffect(() => {
    const configureSystemBars = async () => {
      if (Platform.OS === "android") {
        try {
          // Ocultar barra de navegación
          await NavigationBar.setVisibilityAsync("hidden");

          // Ocultar barra de estado también
          setStatusBarHidden(true, "slide");

          console.log("Barras del sistema ocultas correctamente");
        } catch (error) {
          console.log("Error configurando las barras del sistema:", error);
        }
      }
    };

    configureSystemBars();

    // También intentar configurar cada vez que la app vuelve al foco
    const interval = setInterval(() => {
      if (Platform.OS === "android") {
        try {
          NavigationBar.setVisibilityAsync("hidden");
          setStatusBarHidden(true, "slide");
        } catch (error) {
          // Ignorar errores silenciosamente
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleQRPress = () => {
    navigationRef.current?.navigate("QR");
  };

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    if (state) {
      // Obtener la ruta actual del stack principal
      const currentRouteName = state.routes[state.index]?.name;
      setCurrentRoute(currentRouteName);
    }
  };

  // Solo mostrar el botón QR si no estamos en la pantalla QR, RecyclingMap ni en screens de acciones de la wallet
  const walletActionScreens = [
    "CanjearScreen",
    "SendScreen",
    "ReceiveScreen",
    "RechargeScreen",
    "WalletHistoryScreen",
  ];
  const shouldShowQRButton =
    currentRoute !== "QR" &&
    currentRoute !== "RecyclingMap" &&
    !walletActionScreens.includes(currentRoute ?? "");

  if (!isBeCoinsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar style="light" />
        <NavigationContainer
          ref={navigationRef}
          onStateChange={onNavigationStateChange}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.background,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary || "#000"} />
          </View>
        </NavigationContainer>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />

      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}
      >
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* {user ? (
            // Usuario autenticado - mostrar app principal */}
          <>
              <RootStackNavigator />
              {shouldShowQRButton && (
                <FloatingQRButton onPress={handleQRPress} />
              )}
            </>
          {/* // ) : (
          //   // Usuario no autenticado - mostrar pantallas de auth
          //   <AuthStackNavigator />
          // )} */}
        </View>
      </NavigationContainer>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
