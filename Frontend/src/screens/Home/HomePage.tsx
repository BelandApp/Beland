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

const { width: screenWidth } = Dimensions.get("window");

const HomePage = () => {
  const { user, loginWithAuth0, loginAsDemo } = useAuth();
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAuthRequiredPress = () => {
    if (!user) {
      setModalVisible(true);
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
            onButtonPress={handleAuthRequiredPress}
          />

          <ProductsSection />
          <GroupsSection />

          <SectionCard
            title="Recibe incentivos por reciclar"
            subtitle="Empieza a ganar con Beland."
            buttonText="Regístrate"
            onButtonPress={handleAuthRequiredPress}
          />

          <SectionCard
            title="Compra productos desde tu casa"
            subtitle="Nosotros te los llevamos y reciclamos todos tus residuos."
            buttonText="Empieza a comprar"
            onButtonPress={handleAuthRequiredPress}
          />

          <SectionCard
            title="Juntada Circular"
            subtitle="Organiza tu juntada. Nosotros te lo llevamos y reciclamos."
            buttonText="Organiza tu juntada"
            onButtonPress={handleAuthRequiredPress}
          />

          <SectionCard
            title="Recarga monedas"
            subtitle="Paga sin comisiones, en tiempo real, sin importar tu institución financiera."
            buttonText="Empieza a recargar"
            onButtonPress={handleAuthRequiredPress}
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
    flex: 1, // <--- Añade esta línea
  },
  mainContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    alignItems: "center",
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#386641",
  },
  tagline: {
    fontSize: 14,
    color: "#888",
    marginTop: 4,
  },
  carouselContainer: {
    marginBottom: 20,
  },
  carouselSlide: {
    width: screenWidth - 40,
    height: 180,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "relative",
    marginHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },
  carouselImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    borderRadius: 15,
  },
  carouselTextContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  carouselTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  carouselSubtitle: {
    fontSize: 14,
    color: "#E0E0E0",
  },
  container: {
    padding: 16,
    gap: 16,
    flexDirection: "column",
    paddingBottom: 86,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionCardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  sectionCardSubtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  sectionCardButton: {
    backgroundColor: "#386641",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  sectionCardButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  testimonialsContainer: {
    paddingVertical: 20,
  },
  testimonialsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  quote: {
    fontStyle: "italic",
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
  },
  author: {
    marginTop: 10,
    textAlign: "right",
    fontWeight: "bold",
    color: "#386641",
  },
  footerContainer: {
    paddingVertical: 15,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
  },
});
