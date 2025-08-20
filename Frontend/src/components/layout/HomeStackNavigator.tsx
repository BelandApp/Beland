import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { HistoryScreen } from "../../screens/HistoryScreen";
import { HomeScreen } from "src/screens/HomeScreen";

const Stack = createStackNavigator();

export const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="HistoryScreen" component={HistoryScreen} />
  </Stack.Navigator>
);
