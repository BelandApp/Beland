import React, { useRef, useState, useEffect, useMemo } from "react";
import { ActivityIndicator, Platform, View, StyleSheet } from "react-native";
import { useBeCoinsStoreHydration } from "./src/stores/useBeCoinsStore";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackNavigator } from "./src/components/layout/RootStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useAuth, AuthProvider } from "src/hooks/AuthContext";

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const isBeCoinsLoaded = useBeCoinsStoreHydration();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    // Si el usuario no existe y el navegador ya está montado
    if (!user && navigationRef.current?.isReady()) {
      // Navega a la pantalla Home y resetea el stack
      // Esto evita que el usuario pueda volver al dashboard con el botón de retroceso
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  }, [user]);

  const dynamicPaddingBottom = useMemo(() => {
    if (Platform.OS === "web" && window.innerWidth < 600) {
      const tabbarHeight = 70;
      const extraBottom =
        typeof window.visualViewport !== "undefined" && window.visualViewport
          ? window.innerHeight - window.visualViewport.height
          : 0;
      return tabbarHeight + extraBottom;
    }
    return 0;
  }, []);

  const handleQRPress = () => {
    navigationRef.current?.navigate("QR");
  };

  const onNavigationStateChange = (state: NavigationState | undefined) => {
    if (state) {
      const currentRouteName = state.routes[state.index]?.name;
      setCurrentRoute(currentRouteName);
    }
  };

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

  if (isLoading || !isBeCoinsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}>
        <RootStackNavigator />
      </NavigationContainer>
      {shouldShowQRButton && <FloatingQRButton onPress={handleQRPress} />}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
