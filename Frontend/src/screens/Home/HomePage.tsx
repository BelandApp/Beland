import React, { useState } from "react";
import { AppHeader } from "src/components/layout";
import SectionCard from "./components/SectionCard";
import TestimonialsSection from "./components/TestimonialsSection";
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  View,
} from "react-native";
import CarouselBanner from "./components/BannerSection";
import Footer from "./components/Footer";
import ProductsSection from "./components/ProductsSection";
import { GroupsSection } from "./components/GroupsSection";
import { useAuth } from "src/hooks/AuthContext";
import AuthRequiredModal from "./components/AuthRequiredModal";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "src/components/layout/RootStackNavigator";

const { width: screenWidth } = Dimensions.get("window");

// Tipa la navegación que se usará en este componente
type HomePageNavigationProp = NavigationProp<RootStackParamList, "Home">;

const HomePage = () => {
  const { user, loginWithAuth0 } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<HomePageNavigationProp>();

  // Tipa el parámetro para que TypeScript sepa qué rutas son válidas
  const handleAuthRequiredPress = (
    destinationRoute: keyof RootStackParamList
  ) => {
    if (!user) {
      setModalVisible(true);
    } else {
      // TypeScript ahora sabe que destinationRoute es una clave válida
      navigation.navigate(destinationRoute);
    }
  };

  const handleLogin = () => {
    setModalVisible(false);
    loginWithAuth0();
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={allStyles.safeArea}>
      <ScrollView contentContainerStyle={allStyles.mainContainer}>
        <View style={allStyles.container}>
          <AppHeader />
          <CarouselBanner />

          <SectionCard
            title="Eventos Circulares"
            subtitle="Ven a nuestros eventos y recicla con nosotros."
            buttonText="Reserva tu lugar"
            onButtonPress={() => handleAuthRequiredPress("Catalog")}
          />

          <ProductsSection />
          <GroupsSection />

          <SectionCard
            title="Recibe incentivos por reciclar"
            subtitle="Empieza a ganar con Beland."
            buttonText="Regístrate"
            onButtonPress={() => handleAuthRequiredPress("Catalog")}
          />

          <SectionCard
            title="Compra productos desde tu casa"
            subtitle="Nosotros te los llevamos y reciclamos todos tus residuos."
            buttonText="Empieza a comprar"
            onButtonPress={() => handleAuthRequiredPress("Catalog")}
          />

          <SectionCard
            title="Juntada Circular"
            subtitle="Organiza tu juntada. Nosotros te lo llevamos y reciclamos."
            buttonText="Organiza tu juntada"
            onButtonPress={() => handleAuthRequiredPress("Catalog")}
          />

          <SectionCard
            title="Recarga monedas"
            subtitle="Paga sin comisiones, en tiempo real, sin importar tu institución financiera."
            buttonText="Empieza a recargar"
            onButtonPress={() => handleAuthRequiredPress("Catalog")}
          />

          <TestimonialsSection />
          <Footer />
        </View>
      </ScrollView>
      <AuthRequiredModal
        isVisible={isModalVisible}
        onCancel={handleCancel}
        onConfirm={handleLogin}
      />
    </SafeAreaView>
  );
};

export default HomePage;

const allStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  mainContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
});
