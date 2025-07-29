import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { containerStyles, buttonStyles } from "../styles";

interface GroupsHeaderProps {
  onCreateGroup: () => void;
}

export const GroupsHeader: React.FC<GroupsHeaderProps> = ({
  onCreateGroup,
}) => {
  return (
    <View style={containerStyles.titleContainer}>
      <Text style={containerStyles.sectionTitle}>Mis Grupos</Text>
      <Text style={containerStyles.subtitle}>
        Gestiona tus compras grupales
      </Text>

      <TouchableOpacity
        style={[buttonStyles.createButton, { marginTop: 16 }]}
        activeOpacity={0.8}
        onPress={onCreateGroup}
      >
        <Text style={buttonStyles.createButtonText}>+ Crear Nuevo Grupo</Text>
      </TouchableOpacity>
    </View>
  );
};
