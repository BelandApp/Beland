import React from "react";
import { View, Image, StyleSheet } from "react-native";

export default function SocialButtons() {
  return (
    <View style={styles.container}>
      {/* <Image
        source={require("../../../assets/facebook.png")}
        style={styles.icon}
      />
      <Image
        source={require("../../../assets/google.png")}
        style={styles.icon}
      />
      <Image
        source={require("../../../assets/apple.png")}
        style={styles.icon}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginTop: 20,
    gap: 15,
  },
  icon: {
    width: 30,
    height: 30,
  },
});
