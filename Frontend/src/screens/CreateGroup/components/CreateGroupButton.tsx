import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { buttonStyles } from "../styles";

interface CreateGroupButtonProps {
  isLoading: boolean;
  groupName: string;
  onPress: () => void;
}

export const CreateGroupButton: React.FC<CreateGroupButtonProps> = ({
  isLoading,
  groupName,
  onPress,
}) => {
  const isDisabled = isLoading || !groupName.trim();

  return (
    <TouchableOpacity
      style={[
        buttonStyles.modernCreateButton,
        isDisabled && buttonStyles.modernCreateButtonDisabled,
      ]}
      onPress={isLoading ? () => {} : onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      <View style={buttonStyles.createButtonContent}>
        <Text style={buttonStyles.createButtonIcon}>
          {isLoading ? "⏳" : "🎉"}
        </Text>
        <Text
          style={[
            buttonStyles.modernCreateButtonText,
            isDisabled && buttonStyles.modernCreateButtonTextDisabled,
          ]}
        >
          {isLoading ? "Creando Grupo..." : "Crear Grupo"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
