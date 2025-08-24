import React, { useRef, useState, useEffect, useMemo } from "react";
import { ActivityIndicator, Platform } from "react-native";
import { useBeCoinsStoreHydration } from "./src/stores/useBeCoinsStore";
import { StatusBar } from "expo-status-bar";
import {
  NavigationContainer,
  NavigationContainerRef,
  NavigationState,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  RootStackNavigator,
  RootStackParamList,
} from "./src/components/layout/RootStackNavigator";
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useAuth } from "src/hooks/AuthContext";
import { AuthProvider } from "src/hooks/AuthContext";
import PayphoneSuccessScreen from "./src/screens/Wallet/PayphoneSuccessScreen";

const AppContent = () => {
  // Declarar todos los hooks al inicio, sin condicionales
  const { user, isLoading } = useAuth();
  const isBeCoinsLoaded = useBeCoinsStoreHydration();
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
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
    if (
      Platform.OS === "web" &&
      typeof window !== "undefined" &&
      window.innerWidth < 600
    ) {
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
    if (navigationRef.current) {
      navigationRef.current.navigate("QR");
    }
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
    currentRoute &&
    !walletActionScreens.includes(currentRoute) &&
    !!user;

  if (isLoading || !isBeCoinsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  const isPayphoneSuccess =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/payphone-success");

  if (isPayphoneSuccess) {
    return <PayphoneSuccessScreen />;
  }

  // Configuración de linking para rutas web
  const linking = {
    prefixes: ["http://localhost:8081", "https://tudominio.com"],
    config: {
      screens: {
        PayphoneSuccess: "payphone-success",
        MainTabs: "",
        CanjearScreen: "canjear",
        SendScreen: "send",
        ReceiveScreen: "receive",
        WalletHistoryScreen: "wallet-history",
        RechargeScreen: "recharge",
        WalletSettingsScreen: "wallet-settings",
        QR: "qr",
        RecyclingMap: "recycling-map",
        HistoryScreen: "history",
        UserDashboardScreen: "user-dashboard",
        // Agrega aquí todas las rutas que tienes en RootStackParamList
      },
    },
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar style="light" />
      <NavigationContainer
        ref={navigationRef}

        onStateChange={onNavigationStateChange}>
        <RootStackNavigator />

      </NavigationContainer>
    </View>
  );
};

const App = () => (
  <AuthProvider>
    <SafeAreaProvider>
      <AppContent />
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
