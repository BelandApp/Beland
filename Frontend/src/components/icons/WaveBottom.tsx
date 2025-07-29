import React from "react";
import Svg, { Path, G } from "react-native-svg";

interface WaveBottomProps {
  width?: number;
  height?: number;
}

export const WaveBottom: React.FC<WaveBottomProps> = ({
  width = 375,
  height = 120,
}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 375 120"
      preserveAspectRatio="none"
    >
      <G opacity="0.7">
        <Path
          d="M375 5C367.44 6.13 359.92 7.28 352.39 8.45C345.23 9.58 338.07 10.72 330.9 11.9C295.15 17.8 259.22 24.1 222.5 30.8C180.39 38.9 137.25 47.5 93.67 56.4C76.89 60.1 60.05 63.9 43.12 67.8C28.9 71.2 14.6 74.7 0 78.3V120H375V5Z"
          fill="#6BA43A"
        />
        <Path
          d="M184.61 39.27C204.85 44.8 310.12 67.2 375 27.5V104H0V41.5C4.06 40.74 8.37 39.81 12.98 39.27C77.5 24.5 105.8 25.6 184.61 39.27Z"
          fill="#A9D195"
        />
      </G>
    </Svg>
  );
};
