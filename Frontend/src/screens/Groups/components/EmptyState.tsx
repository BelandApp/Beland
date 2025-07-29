import React from "react";
import { View, Text } from "react-native";
import { groupCardStyles } from "../styles";

interface EmptyStateProps {
  type: "active" | "history";
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type }) => {
  const getEmptyContent = () => {
    if (type === "active") {
      return {
        title: "¡No tienes grupos activos!",
        text: "Crea tu primer grupo para empezar a disfrutar de las compras colaborativas.",
      };
    } else {
      return {
        title: "Sin historial aún",
        text: "Aquí aparecerán tus grupos completados una vez que finalices alguno.",
      };
    }
  };

  const { title, text } = getEmptyContent();

  return (
    <View style={groupCardStyles.emptyState}>
      <Text style={groupCardStyles.emptyTitle}>{title}</Text>
      <Text style={groupCardStyles.emptyText}>{text}</Text>
    </View>
  );
};
