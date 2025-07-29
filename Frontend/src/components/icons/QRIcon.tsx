import React from "react";
import { Svg, Path, Circle } from "react-native-svg";
import { ViewStyle } from "react-native";

interface QRIconProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const QRIcon = ({
  width = 24,
  height = 24,
  style,
  color = "#6B7280",
}: QRIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path d="M3 3H9V9H3V3Z" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M15 3H21V9H15V3Z" stroke={color} strokeWidth="2" fill="none" />
    <Path d="M3 15H9V21H3V15Z" stroke={color} strokeWidth="2" fill="none" />
    <Circle cx="6" cy="6" r="1" fill={color} />
    <Circle cx="18" cy="6" r="1" fill={color} />
    <Circle cx="6" cy="18" r="1" fill={color} />
    <Path d="M15 15H16V16H15V15Z" fill={color} />
    <Path d="M18 15H19V16H18V15Z" fill={color} />
    <Path d="M21 15H22V16H21V15Z" fill={color} />
    <Path d="M15 18H16V19H15V18Z" fill={color} />
    <Path d="M18 18H19V19H18V18Z" fill={color} />
    <Path d="M21 18H22V19H21V18Z" fill={color} />
  </Svg>
);
