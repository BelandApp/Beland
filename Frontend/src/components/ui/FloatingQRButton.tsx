import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { QRIcon } from "../icons";
import { colors } from "../../styles/colors";

interface FloatingQRButtonProps {
  onPress: () => void;
}

export const FloatingQRButton: React.FC<FloatingQRButtonProps> = ({
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.floatingButton}
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
    bottom: 55,
    right: 5,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.belandOrange,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  buttonContent: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
