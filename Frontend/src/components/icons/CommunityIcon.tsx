import React from "react";
import { Svg, Path } from "react-native-svg";

interface CommunityIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const CommunityIcon: React.FC<CommunityIconProps> = ({
  width = 24,
  height = 24,
  color = "#007AFF",
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      fill={color}
    />
  </Svg>
);
