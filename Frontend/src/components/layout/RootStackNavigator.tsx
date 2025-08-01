import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainTabNavigator } from "./MainTabNavigator";
import CanjearScreen from "../../screens/Wallet/CanjearScreen";
import SendScreen from "../../screens/Wallet/SendScreen";
import ReceiveScreen from "../../screens/Wallet/ReceiveScreen";
import HistoryScreen from "../../screens/Wallet/HistoryScreen";
import { QRScannerScreen } from "../../screens/QRScannerScreen";
import { RecyclingMapScreen } from "../../screens";

export type RootStackParamList = {
  MainTabs: undefined;
  QR: undefined;
  RecyclingMap: undefined;
  CanjearScreen: undefined;
  SendScreen: undefined;
  ReceiveScreen: undefined;
  HistoryScreen: undefined;
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
        options={{
          headerShown: true,
          title: "Canjear",
        }}
      />
      <Stack.Screen
        name="SendScreen"
        component={SendScreen}
        options={{
          headerShown: true,
          title: "Enviar",
        }}
      />
      <Stack.Screen
        name="ReceiveScreen"
        component={ReceiveScreen}
        options={{
          headerShown: true,
          title: "Recibir",
        }}
      />
      <Stack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{
          headerShown: true,
          title: "Transacciones",
        }}
      />
      <Stack.Screen
        name="QR"
        component={QRScannerScreen}
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="RecyclingMap"
        component={RecyclingMapScreen}
        options={{
          headerShown: true,
          title: "Mapa de Reciclaje",
        }}
      />
    </Stack.Navigator>
  );
};
