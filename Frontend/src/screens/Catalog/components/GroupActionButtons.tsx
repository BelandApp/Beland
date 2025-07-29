import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { groupActionStyles } from "../styles";

interface GroupActionButtonsProps {
  onBackToGroup: () => void;
  onCancelGroup: () => void;
}

export const GroupActionButtons: React.FC<GroupActionButtonsProps> = ({
  onBackToGroup,
  onCancelGroup,
}) => {
  return (
    <View style={groupActionStyles.groupActionButtons}>
      <TouchableOpacity
        style={groupActionStyles.backToGroupButton}
        onPress={onBackToGroup}
      >
        <Text style={groupActionStyles.backToGroupButtonText}>
          Volver al grupo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={groupActionStyles.cancelGroupButton}
        onPress={onCancelGroup}
      >
        <Text style={groupActionStyles.cancelGroupButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
};
