import React from "react";
import { View, Text, TextInput } from "react-native";
import { formStyles, commonStyles } from "../../styles";

interface GroupBasicInfoProps {
  groupName: string;
  description: string;
  location: string;
  deliveryTime: string;
  errors: any;
  onGroupNameChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onLocationChange: (text: string) => void;
  onTimeChange: (text: string) => void;
}

export const GroupBasicInfo: React.FC<GroupBasicInfoProps> = ({
  groupName,
  description,
  location,
  deliveryTime,
  errors,
  onGroupNameChange,
  onDescriptionChange,
  onLocationChange,
  onTimeChange,
}) => {
  return (
    <>
      <View style={formStyles.inputGroup}>
        <Text style={formStyles.inputLabel}>Nombre del grupo *</Text>
        <TextInput
          style={formStyles.textInput}
          placeholder="Ej: Cumpleaños de Ana"
          value={groupName}
          onChangeText={onGroupNameChange}
        />
        {errors.groupName && (
          <Text style={commonStyles.errorText}>{errors.groupName}</Text>
        )}
      </View>

      <View style={formStyles.inputGroup}>
        <Text style={formStyles.inputLabel}>Descripción (opcional)</Text>
        <TextInput
          style={[formStyles.textInput, formStyles.textArea]}
          placeholder="Describe brevemente la juntada..."
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={formStyles.inputGroup}>
        <Text style={formStyles.inputLabel}>Ubicación *</Text>
        <TextInput
          style={formStyles.textInput}
          placeholder="Ej: Palermo, CABA"
          value={location}
          onChangeText={onLocationChange}
        />
        {errors.location && (
          <Text style={commonStyles.errorText}>{errors.location}</Text>
        )}
      </View>

      <View style={formStyles.inputGroup}>
        <Text style={formStyles.inputLabel}>Horario de entrega *</Text>
        <TextInput
          style={formStyles.textInput}
          placeholder="Ej: 19:30 - 20:00"
          value={deliveryTime}
          onChangeText={onTimeChange}
          keyboardType="numeric"
          maxLength={5}
        />
        {errors.deliveryTime && (
          <Text style={commonStyles.errorText}>{errors.deliveryTime}</Text>
        )}
      </View>
    </>
  );
};
