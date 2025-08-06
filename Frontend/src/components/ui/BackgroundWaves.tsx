import React from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");

interface Props {
  topColor?: string;
  bottomColor?: string;
}

export default function BackgroundWaves({
  topColor = "#FF7C1F",
  bottomColor = "#4CAF50",
}: Props) {
  return (
    <>
      <Svg height="240" width={width} viewBox="0 0 1440 320" style={styles.top}>
        <Path
          fill={topColor}
          d="M0,224L48,197.3C96,171,192,117,288,122.7C384,128,480,192,576,213.3C672,235,768,213,864,192C960,171,1056,149,1152,165.3C1248,181,1344,235,1392,261.3L1440,288L1440,0L0,0Z"
        />
      </Svg>
      <Svg
        height="120"
        width={width}
        viewBox="0 0 1440 320"
        style={styles.bottom}
      >
        <Path
          fill={bottomColor}
          d="M0,160L48,170.7C96,181,192,203,288,218.7C384,235,480,245,576,229.3C672,213,768,171,864,144C960,117,1056,107,1152,122.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L0,320Z"
        />
      </Svg>
    </>
  );
}

const styles = StyleSheet.create({
  top: {
    position: "absolute",
    top: Platform.OS === "android" ? -25 : -30, // Offset más agresivo para pegarse completamente a la parte superior
    left: 0,
    right: 0, // Asegurar que cubra todo el ancho
    zIndex: -1, // Asegurar que esté detrás del contenido
  },
  bottom: {
    position: "absolute",
    bottom: -20, // Movemos más abajo
    left: 0,
    right: 0, // Asegurar que cubra todo el ancho
    zIndex: -1, // Asegurar que esté detrás del contenido
  },
});
