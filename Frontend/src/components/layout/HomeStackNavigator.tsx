import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { DashboardScreen } from "../../screens/DashboardScreen";
import { HistoryScreen } from "../../screens/HistoryScreen";

const Stack = createStackNavigator();

export const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Dashboard" component={DashboardScreen} />
    <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
  </Stack.Navigator>
);
