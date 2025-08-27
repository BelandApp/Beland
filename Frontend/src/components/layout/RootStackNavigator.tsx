import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainTabNavigator } from "./MainTabNavigator";
import CanjearScreen from "../../screens/Wallet/CanjearScreen";
import { ReceiveScreen, CobrarScreen } from "src/screens/Wallet";
import SendScreen from "../../screens/Wallet/SendScreen";
import WalletHistoryScreen from "../../screens/Wallet/WalletHistoryScreen";
import RechargeScreen from "../../screens/Wallet/RechargeScreen";
import WalletSettingsScreen from "../../screens/Wallet/WalletSettingsScreen";
import { QRScannerScreen } from "../../screens/QRScannerScreen";
import PaymentScreen from "../../screens/PaymentScreen";
import { HistoryScreen, RecyclingMapScreen } from "../../screens";
import UserDashboardScreen from "src/screens/UserDashboardScreen";

import PayphoneSuccessScreen from "../../screens/Wallet/PayphoneSuccessScreen";
import { CatalogScreen } from "src/screens/Catalog";

// 1. Define el tipo de tu Root Stack con los nombres correctos
export type RootStackParamList = {
  Home: undefined; // Añadido
  MainTabs: undefined;
  CobrarScreen: undefined;
  Dashboard: undefined;
  CommerceDashboard: undefined; // Corregido: 'CommerceDashboard' para coincidir con el AppHeader
  // Asegúrate de que todas las demás rutas están aquí, tal como las tenías
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
  PaymentScreen: undefined;
  PayphoneSuccess: undefined;
  // Añade aquí cualquier otra ruta que falte.
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="CanjearScreen" component={CanjearScreen} />
      <Stack.Screen name="SendScreen" component={SendScreen} />
      <Stack.Screen
        name="WalletHistoryScreen"
        component={WalletHistoryScreen}
      />
      <Stack.Screen name="RechargeScreen" component={RechargeScreen} />
      <Stack.Screen
        name="WalletSettingsScreen"
        component={WalletSettingsScreen}
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
        options={{ headerShown: true, title: "Beland" }}
      />
      <Stack.Screen
        name="ReceiveScreen"
        component={ReceiveScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PayphoneSuccess"
        component={PayphoneSuccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CobrarScreen"
        component={CobrarScreen}
        options={{ headerShown: false, title: "Cobrar" }}
      />
      {/* <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} /> */}
      <Stack.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{ headerShown: false }}
      />
      {/* 2. Renombra la pantalla para que coincida con el AppHeader */}
      
    </Stack.Navigator>
  );
};