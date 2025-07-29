import { useState, useEffect } from "react";
import { Animated } from "react-native";

export const useMapAnimation = () => {
  const [pulseAnim] = useState(new Animated.Value(1));

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    startPulseAnimation();
  }, []);

  return { pulseAnim, startPulseAnimation };
};
