import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Card } from "../../../components/ui/Card";
import { createGroupStyles, formStyles } from "../styles";
import { FormErrors } from "../../../business/validation/groupValidation";

interface BasicGroupInfoProps {
  groupName: string;
  description: string;
  location: string;
  deliveryTime: string;
  errors: FormErrors;
  onGroupNameChange: (value: string) => void;
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

      {/* Tipo de grupo (desplegable) */}
      <View style={formStyles.modernInputGroup}>
        <View style={formStyles.inputWrapper}>
          <View style={formStyles.inputIconContainer}>
            <Text style={formStyles.inputIcon}>📝</Text>
          </View>
          <View style={formStyles.inputContent}>
            <Text style={formStyles.modernInputLabel}>Tipo de grupo *</Text>
            <View
              style={{
                borderRadius: 14,
                borderWidth: 2,
                borderColor: groupName ? "#4CAF50" : "#E9ECEF",
                backgroundColor: "#fff",
                overflow: "hidden",
                marginTop: 4,
                minHeight: 52,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  color: groupName ? "#222" : "#A0A0A0",
                  fontWeight: groupName ? "600" : "400",
                  flex: 1,
                  paddingVertical: 8,
                }}
              >
                {groupName ? groupName : "Selecciona el tipo de grupo"}
              </Text>
              <Picker
                selectedValue={groupName}
                onValueChange={onGroupNameChange}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                }}
                dropdownIconColor="#4CAF50"
              >
                <Picker.Item
                  label="Selecciona el tipo de grupo"
                  value=""
                  color="#A0A0A0"
                />
                <Picker.Item label="Juntada" value="Juntada" />
                <Picker.Item label="Reunión" value="Reunión" />
                <Picker.Item label="Fiesta" value="Fiesta" />
                <Picker.Item label="Cumpleaños" value="Cumpleaños" />
                <Picker.Item label="Picnic" value="Picnic" />
                <Picker.Item label="Cena" value="Cena" />
                <Picker.Item label="Desayuno" value="Desayuno" />
                <Picker.Item label="Almuerzo" value="Almuerzo" />
                <Picker.Item label="After" value="After" />
                <Picker.Item label="Evento" value="Evento" />
                <Picker.Item label="Otro" value="Otro" />
              </Picker>
              <View style={{ marginLeft: 8 }}>
                <Text style={{ fontSize: 18, color: "#4CAF50" }}>▼</Text>
              </View>
            </View>
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
