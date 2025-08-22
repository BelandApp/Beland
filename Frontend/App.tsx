import React, { useRef, useState, useEffect, useMemo } from "react";
import { ActivityIndicator, Platform, View, StyleSheet } from "react-native";
import { useBeCoinsStoreHydration } from "./src/stores/useBeCoinsStore";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
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
import { useAuth, AuthProvider } from "src/hooks/AuthContext";

const AppContent = () => {
  // Declarar todos los hooks al inicio, sin condicionales
  const { user, isLoading } = useAuth();
  const isBeCoinsLoaded = useBeCoinsStoreHydration();
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(
    undefined
  );

  // Padding dinámico para web móvil
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

  useEffect(() => {
    const configureSystemBars = async () => {
      if (Platform.OS === "android") {
        try {
          await NavigationBar.setVisibilityAsync("hidden");
          setStatusBarHidden(true, "slide");
        } catch (error) {
          console.log("Error configuring system bars:", error);
        }
      }
    };
    configureSystemBars();
    const interval = setInterval(() => {
      if (Platform.OS === "android") {
        try {
          NavigationBar.setVisibilityAsync("hidden");
          setStatusBarHidden(true, "slide");
        } catch (error) {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQRPress = () => {
    if (navigationRef.current) {
      navigationRef.current.navigate("QR");
    }
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
    currentRoute &&
    !walletActionScreens.includes(currentRoute) &&
    !!user;

  // if (isLoading || !isBeCoinsLoaded) {
  //   return (
  //     <View style={appStyles.loadingContainer}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <View style={appStyles.appContainer}>
      <StatusBar style="light" />
      <NavigationContainer
        ref={navigationRef}
        onStateChange={onNavigationStateChange}>
        <View
          style={[appStyles.mainView, { paddingBottom: dynamicPaddingBottom }]}>
          <RootStackNavigator />
          {shouldShowQRButton && <FloatingQRButton onPress={handleQRPress} />}
        </View>
      </NavigationContainer>
    </View>
  );
};

const App = () => (
  <AuthProvider>
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  </AuthProvider>
);

const appStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  appContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  mainView: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
});

export default App;
