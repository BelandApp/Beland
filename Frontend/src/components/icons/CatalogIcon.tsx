import React from "react";
import Svg, { Path } from "react-native-svg";

interface CatalogIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const CatalogIcon: React.FC<CatalogIconProps> = ({
  width = 24,
  height = 24,
  color = "#000000",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 6V4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V6M4 6H20M4 6V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 9H16M8 13H16M8 17H12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
