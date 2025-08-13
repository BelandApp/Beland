import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { MainTabNavigator } from "./MainTabNavigator";
import { SidebarWeb } from "./SidebarWeb";
import { SidebarLayout } from "./SidebarLayout";
import { Platform } from "react-native";
import CanjearScreen from "../../screens/Wallet/CanjearScreen";
import SendScreen from "../../screens/Wallet/SendScreen";
import ReceiveScreen from "../../screens/Wallet/ReceiveScreen";
import WalletHistoryScreen from "../../screens/Wallet/WalletHistoryScreen";
import RechargeScreen from "../../screens/Wallet/RechargeScreen";
import WalletSettingsScreen from "../../screens/Wallet/WalletSettingsScreen";
import { QRScannerScreen } from "../../screens/QRScannerScreen";
import { RecyclingMapScreen } from "../../screens";
import { CatalogScreen } from "../../screens/Catalog/CatalogScreen";
import { GroupsScreen } from "../../screens/Groups/GroupsScreen";
import { WalletScreen } from "../../screens/WalletScreen";
import { RewardsScreen } from "../../screens/RewardsScreen";
import { DashboardScreen } from "../../screens/Dashboard/DashboardScreen";
export type RootStackParamList = {
  MainTabs: undefined;
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
};

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator = () => {
  if (Platform.OS === "web") {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={(props: any) => (
            <SidebarLayout>
              <DashboardScreen {...props} />
            </SidebarLayout>
          )}
        />
        <Stack.Screen
          name="Wallet"
          component={(props: any) => (
            <SidebarLayout>
              <WalletScreen {...props} />
            </SidebarLayout>
          )}
        />
        <Stack.Screen
          name="Rewards"
          component={(props: any) => (
            <SidebarLayout>
              <RewardsScreen {...props} />
            </SidebarLayout>
          )}
        />
        <Stack.Screen
          name="Catalog"
          component={(props: any) => (
            <SidebarLayout>
              <CatalogScreen {...props} />
            </SidebarLayout>
          )}
        />
        <Stack.Screen
          name="Groups"
          component={(props: any) => (
            <SidebarLayout>
              <GroupsScreen {...props} />
            </SidebarLayout>
          )}
        />
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
      </Stack.Navigator>
    );
  }
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
    </Stack.Navigator>
  );
};
