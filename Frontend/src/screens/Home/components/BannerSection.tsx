import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  FlatList,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const CarouselBanner = () => {
  const bannerData = [
    {
      id: "1",
      title: "¡Bienvenido a Beland!",
      subtitle: "Tu camino hacia un futuro más verde.",
      image:
        "https://placehold.co/400x200/52B788/ffffff?text=Bienvenido+a+Beland",
    },
    {
      id: "2",
      title: "Ven a nuestros eventos",
      subtitle: "Regístrate y empieza a ganar.",
      image:
        "https://placehold.co/400x200/5E81AC/ffffff?text=Eventos+Circulares",
    },
    {
      id: "3",
      title: "Productos responsables",
      subtitle: "Compra desde casa y recicla.",
      image: "https://placehold.co/400x200/3A5A40/ffffff?text=Productos",
    },
  ];

  const renderBannerItem = ({ item } : any) => (
    <View style={styles.slide}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        accessibilityLabel={item.title}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={bannerData}
        renderItem={renderBannerItem}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  slide: {
    width: screenWidth - 40,
    height: 180,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "flex-end",
    position: "relative",
    marginHorizontal: 10,
    backgroundColor: "#f0f0f0",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    borderRadius: 15,
  },
  textContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#E0E0E0",
  },
});

export default CarouselBanner;
