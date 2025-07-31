import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "@screens/RecyclingMap/styles/PointCardStyles";
import { RecyclingPoint } from "@screens/RecyclingMap/types/recycling";
import { RECYCLING_TYPES } from "src/data/recyclingData";
import { LocationService } from "@services/locationService";
import { useRecyclingMapContext } from "../context/RecyclingMapContext";
import { colors } from "@styles/colors";

interface PointCardProps {
  point: RecyclingPoint;
  isSelected: boolean;
  onPress: () => void;
  onDirectionsPress: () => void;
}

export const PointCard = ({
  point,
  isSelected,
  onPress,
  onDirectionsPress,
}: PointCardProps) => {
  const { userLocation } = useRecyclingMapContext();

  return (
    <TouchableOpacity
      style={[styles.pointCard, isSelected && styles.selectedPointCard]}
      onPress={onPress}
    >
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>SELECCIONADO</Text>
        </View>
      )}
      <View style={styles.pointHeader}>
        <View style={styles.pointInfo}>
          <Text
            style={[styles.pointName, isSelected && styles.selectedPointName]}
          >
            {point.name}
          </Text>
          <Text style={styles.pointAddress}>{point.address}</Text>
          {userLocation && (
            <Text style={styles.pointDistance}>
              {LocationService.formatDistance(
                LocationService.calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  point.latitude,
                  point.longitude
                )
              )}
            </Text>
          )}
        </View>
        <View style={styles.pointStatus}>
          <View
            style={[styles.statusDot, { backgroundColor: colors.success }]}
          />
          <Text style={styles.statusText}>Abierto</Text>
        </View>
      </View>

      <View style={styles.wasteTypesSection}>
        <Text style={styles.wasteTypesLabel}>Acepta:</Text>
        <View style={styles.wasteTypes}>
          {point.acceptedWasteTypes.slice(0, 3).map((wasteType: string) => {
            const type = RECYCLING_TYPES.find(
              (t: { id: string }) => t.id === wasteType
            );
            return (
              <View key={wasteType} style={styles.wasteTypeChip}>
                <Text style={styles.wasteTypeEmoji}>{type?.emoji}</Text>
                <Text style={styles.wasteTypeName}>{type?.name}</Text>
              </View>
            );
          })}
          {point.acceptedWasteTypes.length > 3 && (
            <View style={styles.moreTypesChip}>
              <Text style={styles.moreTypesText}>
                +{point.acceptedWasteTypes.length - 3}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.directionsButton}
        onPress={onDirectionsPress}
      >
        <Text style={styles.directionsText}>Cómo llegar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
