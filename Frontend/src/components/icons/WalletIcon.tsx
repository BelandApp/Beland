import React from "react";
import { Svg, Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface WalletIconProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const WalletIcon = ({
  width = 24,
  height = 24,
  style,
  color = "#6B7280",
}: WalletIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path
      d="M21 12V7C21 5.9 20.1 5 19 5H5C3.9 5 3 5.9 3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V12Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    <Path d="M3 9H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 15H18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);
