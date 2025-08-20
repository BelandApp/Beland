import React from "react";
import { StyleSheet, Text, View } from "react-native";

const TestimonialsSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Testimonios</Text>
      <View style={styles.testimonialCard}>
        <Text style={styles.quote}>
          "Reciclar con Beland ha sido increíble. ¡Gané premios solo por hacer
          lo correcto!"
        </Text>
        <Text style={styles.author}>- Ana M.</Text>
      </View>
      <View style={styles.testimonialCard}>
        <Text style={styles.quote}>
          "Comprar productos y que reciclen por mí es muy conveniente. ¡Súper
          recomendado!"
        </Text>
        <Text style={styles.author}>- Carlos D.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  title: {
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
});

export default TestimonialsSection;
