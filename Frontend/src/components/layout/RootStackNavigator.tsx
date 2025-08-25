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

export type RootStackParamList = {
  MainTabs: undefined;
  CobrarScreen: undefined;
  Dashboard: undefined;

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
  PaymentScreen: { paymentData: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
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
        name="Catalog"
        component={CatalogScreen}
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
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ headerShown: false, title: "Pago QR" }}
      />
    </Stack.Navigator>
  );
};
