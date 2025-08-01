import React from "react";
import { Svg, Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface HomeIconProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const HomeIcon = ({
  width = 24,
  height = 24,
  style,
  color = "#6B7280",
}: HomeIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path
      d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 22V12H15V22"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
