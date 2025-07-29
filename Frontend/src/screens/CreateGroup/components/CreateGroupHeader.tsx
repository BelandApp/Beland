import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { createGroupStyles } from "../styles";

interface CreateGroupHeaderProps {
  onBackPress: () => void;
}

export const CreateGroupHeader: React.FC<CreateGroupHeaderProps> = ({
  onBackPress,
}) => {
  return (
    <View style={createGroupStyles.titleContainer}>
      <View style={createGroupStyles.headerRow}>
        <TouchableOpacity
          style={createGroupStyles.modernBackButton}
          onPress={onBackPress}
          activeOpacity={0.8}
        >
          <View style={createGroupStyles.backButtonContent}>
            <Text style={createGroupStyles.backButtonIcon}>←</Text>
            <Text style={createGroupStyles.modernBackButtonText}>
              Mis Grupos
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={createGroupStyles.sectionTitle}>Crear Nuevo Grupo</Text>
      <Text style={createGroupStyles.subtitle}>
        Organiza una juntada con productos circulares
      </Text>
    </View>
  );
};
