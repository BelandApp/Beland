import { useState, useRef, useEffect } from "react";
import { Alert, ScrollView } from "react-native";
import { RecyclingPoint } from "@screens/RecyclingMap/types/recycling";
import { MOCK_RECYCLING_POINTS, RECYCLING_TYPES } from "src/data/recyclingData";
import { LocationService } from "@services/locationService";
import { useUserLocation } from "@screens/RecyclingMap/hooks/useUserLocation";
import { useMapAnimation } from "@screens/RecyclingMap/hooks/useMapAnimation";

export const useRecyclingMap = () => {
  const { userLocation, getUserLocation } = useUserLocation();
  const { pulseAnim, startPulseAnimation } = useMapAnimation();
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(
    null
  );
  const [filteredPoints, setFilteredPoints] = useState<RecyclingPoint[]>(
    MOCK_RECYCLING_POINTS
  );
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getUserLocation();
    startPulseAnimation();
  }, []);

  useEffect(() => {
    filterPoints();
  }, [selectedFilters, searchQuery, selectedPoint]);

  const filterPoints = () => {
    let points = [...MOCK_RECYCLING_POINTS];

    if (selectedFilters.length > 0) {
      points = points.filter((point) =>
        selectedFilters.some((filter) =>
          point.acceptedWasteTypes.includes(filter)
        )
      );
    }

    if (searchQuery.trim()) {
      points = points.filter(
        (point) =>
          point.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          point.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (userLocation) {
      points = points
        .map((point) => ({
          ...point,
          distance: LocationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            point.latitude,
            point.longitude
          ),
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    if (selectedPoint) {
      const selectedIndex = points.findIndex((p) => p.id === selectedPoint.id);
      if (selectedIndex > 0) {
        const selectedPointData = points[selectedIndex];
        points.splice(selectedIndex, 1);
        points.unshift(selectedPointData);
      }
    }

    setFilteredPoints(points);
  };

  const toggleFilter = (wasteType: string) => {
    setSelectedFilters((prev) =>
      prev.includes(wasteType)
        ? prev.filter((type) => type !== wasteType)
        : [...prev, wasteType]
    );
  };

  const handlePointPress = (point: RecyclingPoint) => {
    console.log("[HOOK] handlePointPress llamado con:", point?.id, point?.name);
    if (selectedPoint?.id === point.id) {
      setSelectedPoint(null);
      console.log("[HOOK] Deseleccionando punto:", point?.id);
    } else {
      setSelectedPoint(point);
      console.log("[HOOK] Seleccionando punto:", point?.id);
    }
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleDirections = (point: RecyclingPoint) => {
    Alert.alert(
      "Cómo llegar",
      `¿Deseas abrir la navegación hacia ${point.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, navegar",
          onPress: () => console.log("Navigate to", point),
        },
      ]
    );
  };

  return {
    filteredPoints,
    selectedPoint,
    scrollViewRef,
    handlePointPress,
    setSelectedPoint,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    handleDirections,
    pulseAnim,
    userLocation,
    // Log para depuración del estado
    ...(console.log(
      "[HOOK] selectedPoint en return:",
      selectedPoint?.id,
      selectedPoint?.name
    ),
    {}),
  };
};
