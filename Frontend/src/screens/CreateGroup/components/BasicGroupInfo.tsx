import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { createGroupStyles, formStyles } from "../styles";
import { FormErrors } from "../../../business/validation/groupValidation";

interface BasicGroupInfoProps {
  groupName: string;
  description: string;
  location: string;
  deliveryTime: string;
  errors: FormErrors;
  onGroupNameChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onLocationPress: () => void;
  onTimePress: () => void;
}

export const BasicGroupInfo: React.FC<BasicGroupInfoProps> = ({
  groupName,
  description,
  location,
  deliveryTime,
  errors,
  onGroupNameChange,
  onDescriptionChange,
  onLocationPress,
  onTimePress,
}) => {
  return (
    <Card style={createGroupStyles.modernCard}>
      <View style={createGroupStyles.cardHeader}>
        <View style={createGroupStyles.iconContainer}>
          <Text style={createGroupStyles.cardIcon}>🎯</Text>
        </View>
        <View style={createGroupStyles.cardHeaderText}>
          <Text style={createGroupStyles.cardTitle}>Información del Grupo</Text>
          <Text style={createGroupStyles.cardSubtitle}>
            Define los detalles básicos de tu juntada
          </Text>
        </View>
      </View>

      {/* Nombre del grupo */}
      <View style={formStyles.modernInputGroup}>
        <View style={formStyles.inputWrapper}>
          <View style={formStyles.inputIconContainer}>
            <Text style={formStyles.inputIcon}>📝</Text>
          </View>
          <View style={formStyles.inputContent}>
            <Text style={formStyles.modernInputLabel}>Nombre del grupo *</Text>
            <TextInput
              style={formStyles.modernTextInput}
              placeholder="Ej: Cumpleaños de Ana"
              value={groupName}
              onChangeText={onGroupNameChange}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>
        {errors.groupName && (
          <Text style={formStyles.modernErrorText}>{errors.groupName}</Text>
        )}
      </View>

      {/* Descripción */}
      <View style={formStyles.modernInputGroup}>
        <View style={formStyles.inputWrapper}>
          <View style={formStyles.inputIconContainer}>
            <Text style={formStyles.inputIcon}>💭</Text>
          </View>
          <View style={formStyles.inputContent}>
            <Text style={formStyles.modernInputLabel}>
              Descripción (opcional)
            </Text>
            <TextInput
              style={[formStyles.modernTextInput, formStyles.modernTextArea]}
              placeholder="Describe brevemente la juntada..."
              value={description}
              onChangeText={onDescriptionChange}
              multiline
              numberOfLines={3}
              placeholderTextColor="#A0A0A0"
            />
          </View>
        </View>
        {errors.description && (
          <Text style={formStyles.modernErrorText}>{errors.description}</Text>
        )}
      </View>

      {/* Ubicación */}
      <View style={formStyles.modernInputGroup}>
        <TouchableOpacity
          style={formStyles.inputWrapper}
          onPress={onLocationPress}
          activeOpacity={0.8}
        >
          <View style={formStyles.inputIconContainer}>
            <Text style={formStyles.inputIcon}>📍</Text>
          </View>
          <View style={formStyles.inputContent}>
            <Text style={formStyles.modernInputLabel}>Ubicación</Text>
            <View style={formStyles.locationInputContainer}>
              <TextInput
                style={[formStyles.modernTextInput, formStyles.locationInput]}
                placeholder="Toca para seleccionar"
                value={
                  location && location.length > 50
                    ? location.slice(0, 50) + "…"
                    : location
                }
                editable={false}
                placeholderTextColor="#A0A0A0"
                pointerEvents="none"
                multiline
                numberOfLines={2}
              />
              <View style={formStyles.locationInputIcon}>
                <Text style={formStyles.locationIconText}>🗺️</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {errors.location && (
          <Text style={formStyles.modernErrorText}>{errors.location}</Text>
        )}
      </View>

      {/* Horario */}
      <View style={formStyles.modernInputGroup}>
        <TouchableOpacity
          style={formStyles.inputWrapper}
          onPress={onTimePress}
          activeOpacity={0.8}
        >
          <View style={formStyles.inputIconContainer}>
            <Text style={formStyles.inputIcon}>⏰</Text>
          </View>
          <View style={formStyles.inputContent}>
            <Text style={formStyles.modernInputLabel}>Horario de entrega</Text>
            <View style={formStyles.timeInputContainer}>
              <Text
                style={[
                  formStyles.modernTextInput,
                  formStyles.timeDisplayText,
                  !deliveryTime && formStyles.placeholderTime,
                ]}
              >
                {deliveryTime || "Seleccionar horario"}
              </Text>
              <View style={formStyles.timeInputIcon}>
                <Text style={formStyles.timeIconText}>🕒</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        {errors.deliveryTime && (
          <Text style={formStyles.modernErrorText}>{errors.deliveryTime}</Text>
        )}
      </View>
    </Card>
  );
};
