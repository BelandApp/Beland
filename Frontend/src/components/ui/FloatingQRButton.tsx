import React from "react";
import { TouchableOpacity, StyleSheet, View, Platform } from "react-native";
import { QRIcon } from "../icons";
import { colors } from "../../styles/colors";

interface FloatingQRButtonProps {
  onPress: () => void;
}

export const FloatingQRButton: React.FC<FloatingQRButtonProps> = ({
  onPress,
}) => {
  let bottom = 80;
  if (
    typeof window !== "undefined" &&
    window.innerWidth < 600 &&
    Platform.OS === "web"
  ) {
    bottom = 106; // Altura del tabBar (90) + margen extra (16)
  }
  return (
    <TouchableOpacity
      style={{ ...styles.floatingButton, bottom }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.buttonContent}>
        <QRIcon width={28} height={28} color="white" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 5,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.belandOrange,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    // El valor de bottom se aplica inline en el componente
  },
  buttonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
