import React from "react";
import { View, Text } from "react-native";

interface PhoneMapSVGWebProps {
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

export const PhoneMapSVGWeb: React.FC<PhoneMapSVGWebProps> = ({
  width = 160,
  height = 320,
  children,
}) => {
  const phoneWidth = width;
  const phoneHeight = height;

  // Proporciones más realistas para web
  const frameWidth = phoneWidth * 0.56;
  const frameHeight = phoneHeight * 0.88;
  const screenMargin = frameWidth * 0.08;
  const screenWidth = frameWidth - screenMargin * 2;
  const screenHeight = frameHeight - screenMargin * 2.2;

  return (
    <View
      style={{
        width: phoneWidth,
        height: phoneHeight,
        position: "relative",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Base circular verde más sutil */}
      <View
        style={{
          position: "absolute",
          width: phoneWidth * 1.1,
          height: phoneWidth * 1.1,
          borderRadius: (phoneWidth * 1.1) / 2,
          backgroundColor: "#7DA24422",
          top: phoneHeight * 0.08,
          left: (phoneWidth - phoneWidth * 1.1) / 2,
        }}
      />

      {/* Marco del teléfono */}
      <View
        style={{
          width: frameWidth,
          height: frameHeight,
          backgroundColor: "#DF8C37",
          borderRadius: 22,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          borderWidth: 3,
          borderColor: "#B97A2A",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        {/* Pantalla del teléfono */}
        <View
          style={{
            width: screenWidth,
            height: screenHeight,
            backgroundColor: "#B1E4F9",
            borderRadius: 14,
            overflow: "hidden",
            position: "relative",
            marginTop: screenMargin,
          }}
        >
          {/* Contenido del mapa */}
          {children}
        </View>

        {/* Botón home */}
        <View
          style={{
            position: "absolute",
            bottom: 10,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "#DFEAEF",
            borderWidth: 1,
            borderColor: "#B0B0B0",
          }}
        />
      </View>

      {/* Botones laterales pegados al marco */}
      <View
        style={{
          position: "absolute",
          right: (phoneWidth - frameWidth) / 2 - 7,
          top: phoneHeight * 0.36,
          width: 12,
          height: 32,
          backgroundColor: "#3D4951",
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          zIndex: 2,
        }}
      />
      <View
        style={{
          position: "absolute",
          right: (phoneWidth - frameWidth) / 2 - 7,
          top: phoneHeight * 0.52,
          width: 12,
          height: 44,
          backgroundColor: "#3D4951",
          borderTopLeftRadius: 6,
          borderBottomLeftRadius: 6,
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          zIndex: 2,
        }}
      />
    </View>
  );
};
