import React from "react";
import Svg, { Circle, Text as SvgText } from "react-native-svg";

interface CobrarIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const CobrarIcon: React.FC<CobrarIconProps> = ({
  width = 32,
  height = 32,
  color = "#F88D2A",
}) => (
  <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
    <Circle cx="16" cy="16" r="15" fill={color} />
    <SvgText
      x="16"
      y="21"
      textAnchor="middle"
      fontSize="18"
      fontWeight="bold"
      fill="#fff"
      fontFamily="Arial, Helvetica, sans-serif"
    >
      $
    </SvgText>
  </Svg>
);
