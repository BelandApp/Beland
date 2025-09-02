import React from "react";

export interface PayphoneIconProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const PayphoneIcon: React.FC<PayphoneIconProps> = ({
  width = 32,
  height = 32,
  style,
}) => (
  <img
    src="https://cdn.brandfetch.io/idKoQApifx/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1752619044781"
    alt="Payphone"
    width={width}
    height={height}
    style={{ display: "inline-block", borderRadius: 8, ...style }}
  />
);

export default PayphoneIcon;
