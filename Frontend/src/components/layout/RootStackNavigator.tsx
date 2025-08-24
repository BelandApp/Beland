import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainTabNavigator } from "./MainTabNavigator";
import CanjearScreen from "../../screens/Wallet/CanjearScreen";
import SendScreen from "../../screens/Wallet/SendScreen";
import ReceiveScreen from "../../screens/Wallet/ReceiveScreen";
import WalletHistoryScreen from "../../screens/Wallet/WalletHistoryScreen";
import RechargeScreen from "../../screens/Wallet/RechargeScreen";
import WalletSettingsScreen from "../../screens/Wallet/WalletSettingsScreen";
import { QRScannerScreen } from "../../screens/QRScannerScreen";
import {
  DashboardScreen,
  HistoryScreen,
  RecyclingMapScreen,
} from "../../screens";
import UserDashboardScreen from "src/screens/UserDashboardScreen";

import { HomeScreen } from "../../screens/HomeScreen";
import PayphoneSuccessScreen from "../../screens/Wallet/PayphoneSuccessScreen";
import { useAuth } from "src/hooks/AuthContext";
import { CatalogScreen } from "src/screens/Catalog";
import { AuthDeepLinkHandler } from "src/screens/AuthDeepLinkHandler";
import { Linking } from "react-native";




export type RootStackParamList = {
  MainTabs: undefined;
  Dashboard: undefined;
  Home: undefined;
  Wallet: undefined;
  Rewards: undefined;
  QR: undefined;
  RecyclingMap: undefined;
  CanjearScreen: undefined;
  SendScreen: undefined;
  ReceiveScreen: undefined;
  HistoryScreen: undefined;
  WalletHistoryScreen: undefined;
  RechargeScreen: undefined;
  WalletSettingsScreen: undefined;
  Catalog: undefined;
  Groups: undefined;
  UserDashboardScreen: undefined;
  PayphoneSuccess: undefined;
  AuthDeepLinkHandler: { userId?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  const { user } = useAuth();
  const linking = {
    prefixes: ["beland://"], // ✅ Tu prefijo de deep linking
    config: {
      screens: {
        AuthDeepLinkHandler: "login-success", // ✅ Mapea el deep link a tu nueva pantalla
      },
    },
    async getInitialURL() {
      // Maneja el caso en el que la app se abre desde un deep link
      const url = await Linking.getInitialURL();
      if (url && url.startsWith("beland://")) {
        // Devuelve la URL para que el enrutador la procese
        return url;
      }
      return undefined;
    },
  };






  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AuthDeepLinkHandler"
        component={AuthDeepLinkHandler}
        options={{ headerShown: false }}
      />
      
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />

     
      <Stack.Screen
        name="CanjearScreen"
        component={CanjearScreen}
        options={{ headerShown: false, title: "Canjear" }}
      />
      
      <Stack.Screen
        name="SendScreen"
        component={SendScreen}
        options={{ headerShown: false, title: "Enviar" }}
      />

      <Stack.Screen
        name="ReceiveScreen"
        component={ReceiveScreen}
        options={{ headerShown: false, title: "Recibir" }}
      />
   
      <Stack.Screen
        name="WalletHistoryScreen"
        component={WalletHistoryScreen}
        options={{ headerShown: false }}
      />
   
      <Stack.Screen
        name="RechargeScreen"
        component={RechargeScreen}
        options={{ headerShown: false }}
      />
    
      <Stack.Screen
        name="WalletSettingsScreen"
        component={WalletSettingsScreen}
        options={{ headerShown: false }}
      />
    
      <Stack.Screen
        name="QR"
        component={QRScannerScreen}
        options={{ presentation: "modal" }}
      />
  
      <Stack.Screen
        name="RecyclingMap"
        component={RecyclingMapScreen}
        options={{ headerShown: true, title: "Mapa de Reciclaje" }}
      />
 
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="UserDashboardScreen"
        component={UserDashboardScreen}
        options={{
          headerShown: true,
          title: "Beland",
        }}
      />

      <Stack.Screen
        name="PayphoneSuccess"
        component={PayphoneSuccessScreen}
        options={{ headerShown: false, title: "Recarga Payphone" }}
      />

    </Stack.Navigator>
  );
};
