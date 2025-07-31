import React from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundWaves from "../../components/BackgroundWaves";
import SocialButtons from "./components/SocialButtons";
import { styles } from "./styles";

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        <BackgroundWaves />

        {/* 🔹 Contenedor centrado y con ancho máximo */}
        <View style={styles.container}>
          {/* <Image
            source={require("../../../../assets/logo.png")}
            style={styles.logo}
          /> */}
          <Text style={styles.title}>beland</Text>

          <TextInput
            placeholder="Correo electrónico"
            style={styles.input}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Contraseña"
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Ingresar</Text>
          </TouchableOpacity>

          <SocialButtons />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
