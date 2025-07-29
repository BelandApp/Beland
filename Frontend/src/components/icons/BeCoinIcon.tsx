import React from "react";
import Svg, { Circle, Text } from "react-native-svg";

interface BeCoinIconProps {
  width?: number;
  height?: number;
}

export const BeCoinIcon: React.FC<BeCoinIconProps> = ({
  width = 24,
  height = 24,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="12" fill="#FAB400" />
      <Circle cx="12" cy="12" r="10" fill="#F7CC00" />
      <Text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#D89005"
      >
        BC
      </Text>
    </Svg>
  );
};
