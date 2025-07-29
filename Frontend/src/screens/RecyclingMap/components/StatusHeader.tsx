import React from "react";
import { View, Text } from "react-native";
import { styles } from "@screens/RecyclingMap/styles/FilterStyles";

interface StatusHeaderProps {
  pointCount: number;
}

export const StatusHeader = ({ pointCount }: StatusHeaderProps) => (
  <View style={styles.header}>
    <Text style={styles.title}>Puntos de Reciclaje</Text>
    <Text style={styles.subtitle}>{pointCount} puntos encontrados</Text>
  </View>
);
