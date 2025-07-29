import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainTabNavigator } from "./MainTabNavigator";
import { QRScannerScreen } from "../../screens/QRScannerScreen";
import { RecyclingMapScreen } from "../../screens";

export type RootStackParamList = {
  MainTabs: undefined;
  QR: undefined;
  RecyclingMap: undefined;
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
