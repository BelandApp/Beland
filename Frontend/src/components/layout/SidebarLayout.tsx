import React from "react";
import { View, Platform } from "react-native";
import { SidebarWeb } from "./SidebarWeb";
import { useNavigation, useRoute } from "@react-navigation/native";

export const SidebarLayout = ({ navigation, route, children }: any) => {
  // El stack de navegación renderiza esta pantalla, así que el contenido activo se muestra aquí
  if (Platform.OS === "web") {
    return (
      <div className="sidebar-layout-web">
        <div className="sidebar">
          <SidebarWeb />
        </div>
        <div className="sidebar-content">{children}</div>
      </div>
    );
  }
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <SidebarWeb />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};
