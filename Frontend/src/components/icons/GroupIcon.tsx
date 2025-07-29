import React from "react";
import { Svg, Path } from "react-native-svg";

interface GroupIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const GroupIcon: React.FC<GroupIconProps> = ({
  width = 24,
  height = 24,
  color = "#000000",
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z"
        fill={color}
      />
      <Path
        d="M8 6C9.65685 6 11 7.34315 11 9C11 10.6569 9.65685 12 8 12C6.34315 12 5 10.6569 5 9C5 7.34315 6.34315 6 8 6Z"
        fill={color}
      />
      <Path
        d="M15 14C18.866 14 22 17.134 22 21H10C10 17.134 13.134 14 15 14H15Z"
        fill={color}
      />
      <Path
        d="M8.5 14C11.5376 14 14 16.4624 14 19.5V21H2V19.5C2 16.4624 4.46243 14 7.5 14H8.5Z"
        fill={color}
      />
    </Svg>
  );
};
