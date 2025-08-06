import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Animated } from "react-native";
import { ConfirmationAlert } from "../../../components/ui";
import * as Location from "expo-location";
import { RecyclingPoint } from "@screens/RecyclingMap/types/recycling";
import { MOCK_RECYCLING_POINTS } from "src/data/recyclingData";

interface RecyclingMapContextProps {
  filteredPoints: RecyclingPoint[];
  selectedPoint: RecyclingPoint | null;
  userLocation: any;
  handlePointPress: (point: RecyclingPoint) => void;
  setSelectedPoint: (point: RecyclingPoint | null) => void;
  scrollViewRef: React.RefObject<any>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFilters: string[];
  toggleFilter: (wasteType: string) => void;
  handleDirections: (point: RecyclingPoint) => void;
}

const RecyclingMapContext = createContext<RecyclingMapContextProps | undefined>(
  undefined
);

export const RecyclingMapProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filteredPoints, setFilteredPoints] = useState<RecyclingPoint[]>(
    MOCK_RECYCLING_POINTS
  );
  const [selectedPoint, setSelectedPoint] = useState<RecyclingPoint | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<any>(null);
  const scrollViewRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showNavAlert, setShowNavAlert] = useState(false);
  const [pendingNavPoint, setPendingNavPoint] = useState<RecyclingPoint | null>(
    null
  );

  // Filtros y búsqueda (simplificado)
  useEffect(() => {
    let points = MOCK_RECYCLING_POINTS;
    if (searchQuery) {
      points = points.filter((p: RecyclingPoint) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedFilters.length > 0) {
      points = points.filter((p: RecyclingPoint) =>
        selectedFilters.every((type) => p.acceptedWasteTypes.includes(type))
      );
    }
    setFilteredPoints(points);
  }, [searchQuery, selectedFilters]);

  const toggleFilter = (wasteType: string) => {
    setSelectedFilters((prev) =>
      prev.includes(wasteType)
        ? prev.filter((type) => type !== wasteType)
        : [...prev, wasteType]
    );
  };

  const handlePointPress = (point: RecyclingPoint) => {
    if (selectedPoint?.id === point.id) {
      setSelectedPoint(null);
    } else {
      setSelectedPoint(point);
    }
    scrollViewRef.current?.scrollTo?.({ y: 0, animated: true });
  };

  const handleDirections = (point: RecyclingPoint) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${point.latitude},${point.longitude}`;
    if (typeof window !== "undefined" && window.open) {
      window.open(url, "_blank");
    } else {
      setPendingNavPoint(point);
      setShowNavAlert(true);
    }
  };

  const handleConfirmNav = () => {
    if (!pendingNavPoint) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${pendingNavPoint.latitude},${pendingNavPoint.longitude}`;
    try {
      const Linking = require("react-native").Linking;
      Linking.openURL(url);
    } catch {}
    setShowNavAlert(false);
    setPendingNavPoint(null);
  };

  const handleCancelNav = () => {
    setShowNavAlert(false);
    setPendingNavPoint(null);
  };

  // Simulación de obtención de ubicación
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Permiso de ubicación denegado");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.log("Error obteniendo ubicación:", error);
      }
    })();
  }, []);

  return (
    <>
      <RecyclingMapContext.Provider
        value={{
          filteredPoints,
          selectedPoint,
          userLocation,
          handlePointPress,
          setSelectedPoint,
          scrollViewRef,
          searchQuery,
          setSearchQuery,
          selectedFilters,
          toggleFilter,
          handleDirections,
        }}
      >
        {children}
      </RecyclingMapContext.Provider>
      {pendingNavPoint && (
        <ConfirmationAlert
          visible={showNavAlert}
          title="Navegación"
          message={`¿Quieres abrir Google Maps para navegar hasta:\n\n🏷️ ${pendingNavPoint.name}\n📍 ${pendingNavPoint.address}`}
          onConfirm={handleConfirmNav}
          onCancel={handleCancelNav}
          confirmText="Abrir Google Maps"
          cancelText="Cancelar"
          type="info"
          icon={"🗺️"}
        />
      )}
    </>
  );
};

export const useRecyclingMapContext = () => {
  const context = useContext(RecyclingMapContext);
  if (!context) {
    throw new Error(
      "useRecyclingMapContext debe usarse dentro de RecyclingMapProvider"
    );
  }
  return context;
};
