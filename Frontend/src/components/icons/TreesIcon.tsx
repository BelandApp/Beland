import React from "react";
import { Svg, Path, Circle } from "react-native-svg";
import { ViewStyle } from "react-native";
import { colors } from "../../styles/colors";

interface TreesIconProps {
  width?: number;
  height?: number;
  style?: ViewStyle;
  color?: string;
}

export const TreesIcon = ({
  width = 80,
  height = 64,
  style,
  color = colors.belandGreen,
}: TreesIconProps) => (
  <Svg width={width} height={height} viewBox="0 0 80 64" style={style}>
    {/* Árbol 1 */}
    <Path d="M15 50 L15 60 L19 60 L19 50 Z" fill="#8B4513" />
    <Circle cx="17" cy="42" r="8" fill={color} />
    <Circle cx="14" cy="38" r="6" fill={color} />
    <Circle cx="21" cy="40" r="7" fill={color} />

    {/* Árbol 2 */}
    <Path d="M35 48 L35 60 L40 60 L40 48 Z" fill="#8B4513" />
    <Circle cx="37.5" cy="40" r="10" fill={color} />
    <Circle cx="33" cy="35" r="8" fill={color} />
    <Circle cx="42" cy="37" r="8" fill={color} />
    <Circle cx="37.5" cy="30" r="6" fill={color} />

    {/* Árbol 3 */}
    <Path d="M58 52 L58 60 L62 60 L62 52 Z" fill="#8B4513" />
    <Circle cx="60" cy="44" r="9" fill={color} />
    <Circle cx="55" cy="40" r="7" fill={color} />
    <Circle cx="65" cy="42" r="7" fill={color} />
    <Circle cx="60" cy="35" r="5" fill={color} />
  </Svg>
);
