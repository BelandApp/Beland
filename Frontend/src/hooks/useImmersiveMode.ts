import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";

export const useSystemBars = () => {
  useEffect(() => {
    if (Platform.OS === "android") {
      const setupNavigationBar = async () => {
        try {
          // Intentar ocultar la barra sin verificar el comportamiento
          // Si falla, significa que edge-to-edge está habilitado
          await NavigationBar.setVisibilityAsync("hidden");
        } catch (error) {
          // Silenciosamente ignorar si edge-to-edge está habilitado
          console.log("Navigation bar hidden (edge-to-edge mode)");
        }
      };

      setupNavigationBar();
    }
  }, []);
};
