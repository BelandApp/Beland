import { useNavigation } from "@react-navigation/native";

export const useDashboardNavigation = () => {
  const navigation = useNavigation();

  const handleMenuPress = () => {
    // Navegar a configuración
    console.log("Menu pressed");
  };

  const handleViewHistory = () => {
    // Navegar a la pantalla de historial oculta
    navigation.navigate("History" as never);
  };

  const handleCoinsPress = () => {
    // Acción para presionar en las monedas
    console.log("Coins pressed");
  };

  const handleRecyclingMapPress = () => {
    // Navegar a la pantalla completa del mapa de reciclaje
    navigation.navigate("RecyclingMap" as never);
  };

  return {
    handleMenuPress,
    handleViewHistory,
    handleCoinsPress,
    handleRecyclingMapPress,
  };
};
