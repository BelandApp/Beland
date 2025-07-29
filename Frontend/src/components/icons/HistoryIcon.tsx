import React from "react";
import { Svg, Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface HistoryIconProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const HistoryIcon = ({
  width = 24,
  height = 24,
  style,
  color = "#6B7280",
}: HistoryIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path
      d="M3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C9.5 3 7.26 4.11 5.64 5.86"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M3 5V9H7"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 7V12L16 14"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
