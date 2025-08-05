import React, { useEffect, useState } from "react";
import { View, StyleSheet, Animated, Platform } from "react-native";
import { colors } from "../../../styles/colors";
import { RecyclingPoint, UserLocation } from "../../../types/recycling";
import { MOCK_RECYCLING_POINTS } from "../../../data/recyclingData";
import { LocationService } from "../../../services/locationService";

export const MiniMapContentWeb: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestPoints, setNearestPoints] = useState<RecyclingPoint[]>([]);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (Platform.OS === "web") {
      // En web, usar ubicación por defecto para evitar problemas de permisos
      const defaultLocation = {
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 100,
      };
      setUserLocation(defaultLocation);
      setNearestPoints(MOCK_RECYCLING_POINTS.slice(0, 5));
    } else {
      getUserLocation();
    }
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: Platform.OS !== "web", // Deshabilitar useNativeDriver en web
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    ).start();
  };

  const getUserLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      if (location) {
        setUserLocation(location);

        const pointsWithDistance = MOCK_RECYCLING_POINTS.map((point) => ({
          ...point,
          distance: LocationService.calculateDistance(
            location.latitude,
            location.longitude,
            point.latitude,
            point.longitude
          ),
        }))
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);

        setNearestPoints(pointsWithDistance);
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      const defaultLocation = {
        latitude: -34.6037,
        longitude: -58.3816,
        accuracy: 100,
      };
      setUserLocation(defaultLocation);
      setNearestPoints(MOCK_RECYCLING_POINTS.slice(0, 5));
    }
  };

  const coordinatesToMiniMapPosition = (
    latitude: number,
    longitude: number
  ) => {
    if (!userLocation) return { left: 50, top: 50 };

    const mapBounds = {
      north: -34.55,
      south: -34.65,
      west: -58.5,
      east: -58.35,
    };

    const xPercent =
      (longitude - mapBounds.west) / (mapBounds.east - mapBounds.west);
    const yPercent =
      (mapBounds.north - latitude) / (mapBounds.north - mapBounds.south);

    const constrainedX = Math.max(5, Math.min(95, xPercent * 100));
    const constrainedY = Math.max(5, Math.min(95, yPercent * 100));

    return {
      left: constrainedX,
      top: constrainedY,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapBackground} />

      {/* Líneas de calles */}
      <View
        style={[styles.street, { top: "30%", left: 0, right: 0, height: 1 }]}
      />
      <View
        style={[styles.street, { top: "60%", left: 0, right: 0, height: 1 }]}
      />
      <View
        style={[styles.street, { left: "25%", top: 0, bottom: 0, width: 1 }]}
      />
      <View
        style={[styles.street, { left: "65%", top: 0, bottom: 0, width: 1 }]}
      />

      {/* Ubicación del usuario */}
      {userLocation && (
        <View
          style={[
            styles.userLocationWrapper,
            {
              left: `${
                coordinatesToMiniMapPosition(
                  userLocation.latitude,
                  userLocation.longitude
                ).left
              }%`,
              top: `${
                coordinatesToMiniMapPosition(
                  userLocation.latitude,
                  userLocation.longitude
                ).top
              }%`,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: Platform.OS === "web" ? [] : [{ scale: pulseAnim }],
            }}
          >
            <View style={styles.userLocation}>
              <View style={styles.userDot} />
            </View>
          </Animated.View>
        </View>
      )}

      {/* Puntos de reciclaje */}
      {nearestPoints.map((point, index) => {
        const position = coordinatesToMiniMapPosition(
          point.latitude,
          point.longitude
        );
        const isNearest = index === 0;

        return (
          <View
            key={point.id}
            style={[
              styles.recyclingPoint,
              {
                left: `${position.left}%`,
                top: `${position.top}%`,
              },
              isNearest && styles.nearestPoint,
            ]}
          >
            <View style={[styles.pointDot, isNearest && styles.nearestDot]}>
              <View style={styles.pointInner} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F4FD",
    position: "relative",
  },
  mapBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#E8F4FD",
  },
  street: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  userLocationWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
  userLocation: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(248, 141, 42, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F88D2A",
  },
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F88D2A",
  },
  recyclingPoint: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  pointDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  nearestPoint: {},
  nearestDot: {
    backgroundColor: "#F88D2A",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pointInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
});
