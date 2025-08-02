import React, { useRef, useState } from "react";
import { ActivityIndicator } from "react-native";
import { useBeCoinsStoreHydration } from "./src/stores/useBeCoinsStore";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackNavigator } from "./src/components/layout/RootStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useSystemBars } from "./src/hooks/useImmersiveMode";
import { colors } from "./src/styles/colors";
import { LoginScreen } from "src/screens/Login";
import { AuthProvider } from "src/hooks/AuthContext";

export default function App() {
  // Hidratar solo el store de BeCoins antes de renderizar la app
  const isBeCoinsLoaded = useBeCoinsStoreHydration();
  // Hook mejorado que maneja edge-to-edge automáticamente
  useSystemBars();

  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );

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

  // Solo mostrar el botón QR si no estamos en la pantalla QR ni en RecyclingMap
  const shouldShowQRButton =
    currentRoute !== "QR" && currentRoute !== "RecyclingMap";

  if (!isBeCoinsLoaded) {
    return (
      <SafeAreaProvider>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <StatusBar style="light" />
            <NavigationContainer
              ref={navigationRef}
              onStateChange={onNavigationStateChange}>
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.background,
                }}>
                <ActivityIndicator
                  size="large"
                  color={colors.primary || "#000"}
                />
              </View>
            </NavigationContainer>
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <StatusBar style="light" />

          <NavigationContainer
            ref={navigationRef}
            onStateChange={onNavigationStateChange}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <RootStackNavigator />
              {shouldShowQRButton && (
                <FloatingQRButton onPress={handleQRPress} />
              )}
            </View>
          </NavigationContainer>
        </View>
        {/* <LoginScreen /> */}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
