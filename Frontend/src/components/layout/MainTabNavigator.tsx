import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { colors } from "../../styles/colors";
import { DashboardScreen } from "../../screens/DashboardScreen";
import { WalletScreen } from "../../screens/WalletScreen";
import { RewardsScreen } from "../../screens/RewardsScreen";
import { CatalogScreen } from "../../screens/CatalogScreen";
import { HistoryScreen } from "../../screens/HistoryScreen";
import { GroupsStackNavigator } from "./GroupsStackNavigator";

import {
  HomeIcon,
  QRIcon,
  WalletIcon,
  CatalogIcon,
  GiftIcon,
  GroupIcon,
} from "../icons";

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const iconProps = {
            width: size,
            height: size,
            color: focused ? colors.belandOrange : colors.textSecondary,
          };

          switch (route.name) {
            case "Home":
              return <HomeIcon {...iconProps} />;
            case "QR":
              return <QRIcon {...iconProps} />;
            case "Wallet":
              return <WalletIcon {...iconProps} />;
            case "Rewards":
              return <GiftIcon {...iconProps} />;
            case "Catalog":
              return <CatalogIcon {...iconProps} />;
            case "Groups":
              return <GroupIcon {...iconProps} />;
            default:
              return <HomeIcon {...iconProps} />;
          }
        },
        tabBarActiveTintColor: colors.belandOrange,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarAllowFontScaling: false,
        tabBarBackground: () => (
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFFFFF",
              overflow: "hidden",
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          paddingBottom: Platform.OS === "android" ? 16 : 8, // Más padding inferior en Android
          paddingTop: 8,
          height: Platform.OS === "android" ? 80 : 70, // Altura fija para asegurar espacio
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          ...(Platform.OS === "android" && {
            // Esto desactiva el efecto ripple en Android
            borderBottomWidth: 0,
          }),
        },
        tabBarItemStyle: {
          paddingHorizontal: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
          marginBottom: Platform.OS === "android" ? 4 : 0, // Margen inferior adicional en Android
        },
        headerShown: false,
        tabBarHideOnKeyboard: true, // Oculta la barra cuando aparece el teclado
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: "Inicio" }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{ tabBarLabel: "Wallet" }}
      />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ tabBarLabel: "Premios" }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{ tabBarLabel: "Catálogo" }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupsStackNavigator}
        options={{ tabBarLabel: "Grupos" }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarButton: () => null, // Oculta esta pestaña de la barra de navegación
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  navigatorContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tempScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tempContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  tempTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  tempText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
