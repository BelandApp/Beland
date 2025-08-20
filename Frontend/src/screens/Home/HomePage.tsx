import { AppHeader } from "src/components/layout";
import SectionCard from "./components/SectionCard";
import TestimonialsSection from "./components/TestimonialsSection";
import { StyleSheet, SafeAreaView, ScrollView, Dimensions } from "react-native";
import CarouselBanner from "./components/BannerSection";
import Footer from "./components/Footer";
import ProductsSection from "./components/ProductsSection";

const { width: screenWidth } = Dimensions.get("window");

// Hoja de Estilos Centralizada y Unificada


const HomeView = () => {
  const handleEventsPress = () => console.log("Ir a la página de eventos");
  const handleIncentivesPress = () => console.log("Ir a la página de registro");
  const handleProductsPress = () => console.log("Ir a la página de compras");
  const handleJuntadaPress = () => console.log("Ir a la página de juntadas");
  const handleReloadPress = () => console.log("Ir a la página de recargas");

  return (
    <SafeAreaView style={allStyles.safeArea}>
      <AppHeader />
      <ScrollView contentContainerStyle={allStyles.mainContainer}>
        <CarouselBanner />

        {/* Sección 1: Eventos Circulares */}
        <SectionCard
          title="Eventos Circulares"
          subtitle="Ven a nuestros eventos y recicla con nosotros."
          buttonText="Reserva tu lugar"
          onButtonPress={handleEventsPress}
        />

        <ProductsSection/>

        {/* Sección 2: Recibe incentivos por reciclar */}
        <SectionCard
          title="Recibe incentivos por reciclar"
          subtitle="Empieza a ganar con Beland."
          buttonText="Regístrate"
          onButtonPress={handleIncentivesPress}
        />

        {/* Sección 3: Compra productos desde tu casa */}
        <SectionCard
          title="Compra productos desde tu casa"
          subtitle="Nosotros te los llevamos y reciclamos todos tus residuos."
          buttonText="Empieza a comprar"
          onButtonPress={handleProductsPress}
        />

        {/* Sección 4: Juntada Circular */}
        <SectionCard
          title="Juntada Circular"
          subtitle="Organiza tu juntada. Nosotros te lo llevamos y reciclamos."
          buttonText="Organiza tu juntada"
          onButtonPress={handleJuntadaPress}
        />

        {/* Sección 5: Recarga monedas */}
        <SectionCard
          title="Recarga monedas"
          subtitle="Paga sin comisiones, en tiempo real, sin importar tu institución financiera."
          buttonText="Empieza a recargar"
          onButtonPress={handleReloadPress}
        />

        {/* Sección de Testimonios */}
        <TestimonialsSection />
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
};

export default HomeView;

const allStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
