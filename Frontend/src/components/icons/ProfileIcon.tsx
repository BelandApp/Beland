import React from "react";
import { Svg, Path } from "react-native-svg";
import { ViewStyle } from "react-native";

interface ProfileIconProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const ProfileIcon = ({
  width = 24,
  height = 24,
  style,
  color = "#6B7280",
}: ProfileIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" style={style}>
    <Path
      d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
