import React, { useRef, useState, useEffect, useMemo } from "react";
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
import { FloatingQRButton } from "./src/components/ui/FloatingQRButton";
import { useAuth } from "src/hooks/AuthContext";
import { AuthProvider } from "src/hooks/AuthContext";
import PayphoneSuccessScreen from "./src/screens/Wallet/PayphoneSuccessScreen";

const AppContent = () => {
  // Declarar todos los hooks al inicio, sin condicionales
  const { user, isLoading } = useAuth();
  const isBeCoinsLoaded = useBeCoinsStoreHydration();
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );
  // Padding dinámico para web móvil
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

  // if (isLoading || !isBeCoinsLoaded) {
  //   return (
  //     <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
  //       <StatusBar style="light" />
  //       <NavigationContainer
  //         ref={navigationRef}
  //         onStateChange={onNavigationStateChange}
  //       >
  //         <View
  //           style={{
  //             flex: 1,
  //             justifyContent: "center",
  //             alignItems: "center",
  //             backgroundColor: "#F7F8FA",
  //           }}
  //         >
  //           <ActivityIndicator size="large" color="#FF7A00" />
  //         </View>
  //       </NavigationContainer>
  //     </View>
  //   );
  // }

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
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <StatusBar style="light" />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}
        linking={linking}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#F7F8FA",
            paddingBottom: dynamicPaddingBottom,
          }}
        >
          <RootStackNavigator />
          {shouldShowQRButton && <FloatingQRButton onPress={handleQRPress} />}
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
