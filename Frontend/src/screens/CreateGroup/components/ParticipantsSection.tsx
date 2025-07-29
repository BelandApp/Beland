import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { InstagramSearchInput } from "../../../components/ui/InstagramSearchInput";
import { Participant } from "../../../types";
import { FormErrors } from "../../../business/validation/groupValidation";
import { participantStyles } from "../styles";
import { useCreateGroupStore } from "../../../stores/useCreateGroupStore";

import { InstagramUser } from "../../../services/instagramService";

interface ParticipantsSectionProps {
  participants: Participant[];
  newParticipantName: string;
  newParticipantInstagram: string;
  errors: FormErrors;
  onParticipantNameChange: (text: string) => void;
  onParticipantInstagramChange: (text: string) => void;
  onInstagramUserSelect: (user: InstagramUser) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (id: string) => void;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  participants,
  newParticipantName,
  newParticipantInstagram,
  errors,
  onParticipantNameChange,
  onParticipantInstagramChange,
  onInstagramUserSelect,
  onAddParticipant,
  onRemoveParticipant,
}) => {
  const consumo = useCreateGroupStore((s) => s.consumo);
  const setConsumo = useCreateGroupStore((s) => s.setConsumo);

  return (
    <Card style={participantStyles.modernCard}>
      <View style={participantStyles.cardHeader}>
        <View style={participantStyles.iconContainer}>
          <Text style={participantStyles.cardIcon}>👥</Text>
        </View>
        <View style={participantStyles.cardHeaderText}>
          <Text style={participantStyles.cardTitle}>
            Participantes ({participants.length + 1})
          </Text>
          <Text style={participantStyles.cardSubtitle}>
            Invita a tus amigos a la juntada circular
          </Text>
        </View>
      </View>

      {/* Selector de consumo */}
      <View
        style={{
          marginBottom: 18,
          padding: 14,
          backgroundColor: "#F8F9FA",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#E9ECEF",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            fontSize: 15,
            marginBottom: 10,
            color: "#222",
            textAlign: "center",
          }}
        >
          ¿Cuánto quieren consumir en la juntada?
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <TouchableOpacity
            style={{
              minWidth: 70,
              paddingHorizontal: 10,
              backgroundColor: consumo === "poco" ? "#ffe5e0" : "#fff",
              borderColor: consumo === "poco" ? "#ff7043" : "#E9ECEF",
              borderWidth: 2,
              borderRadius: 16,
              marginHorizontal: 4,
              paddingVertical: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setConsumo("poco")}
            activeOpacity={0.85}
          >
            <Text
              style={{
                color: "#ff7043",
                fontWeight: consumo === "poco" ? "800" : "500",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Poco
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              minWidth: 90,
              paddingHorizontal: 10,
              backgroundColor: consumo === "normal" ? "#e0f7fa" : "#fff",
              borderColor: consumo === "normal" ? "#00bcd4" : "#E9ECEF",
              borderWidth: 2,
              borderRadius: 16,
              marginHorizontal: 4,
              paddingVertical: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setConsumo("normal")}
            activeOpacity={0.85}
          >
            <Text
              style={{
                color: "#00bcd4",
                fontWeight: consumo === "normal" ? "800" : "500",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Más o menos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              minWidth: 70,
              paddingHorizontal: 10,
              backgroundColor: consumo === "mucho" ? "#e8f5e9" : "#fff",
              borderColor: consumo === "mucho" ? "#43a047" : "#E9ECEF",
              borderWidth: 2,
              borderRadius: 16,
              marginHorizontal: 4,
              paddingVertical: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => setConsumo("mucho")}
            activeOpacity={0.85}
          >
            <Text
              style={{
                color: "#43a047",
                fontWeight: consumo === "mucho" ? "800" : "500",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              Mucho
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            fontSize: 13,
            color: "#444",
            marginTop: 4,
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          Consignación:{" "}
          <Text style={{ fontWeight: "400" }}>
            Solo pagan lo que consumen. ¡Pidan sin miedo!
          </Text>
        </Text>
      </View>

      {/* Participante actual (usuario) */}
      <View style={participantStyles.currentUserContainer}>
        <View style={participantStyles.participantAvatar}>
          <Text style={participantStyles.avatarText}>Tú</Text>
        </View>
        <View style={participantStyles.participantInfo}>
          <Text style={participantStyles.participantName}>
            Tú (organizador)
          </Text>
          <Text style={participantStyles.participantRole}>
            Creador del grupo
          </Text>
        </View>
        <View style={participantStyles.statusBadge}>
          <Text style={participantStyles.statusText}>✓</Text>
        </View>
      </View>

      {/* Lista de participantes */}
      {participants.map((participant) => (
        <View
          key={participant.id}
          style={participantStyles.modernParticipantItem}
        >
          <View style={participantStyles.participantAvatar}>
            <Text style={participantStyles.avatarText}>
              {participant.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={participantStyles.participantInfo}>
            <Text style={participantStyles.participantName}>
              {participant.name}
            </Text>
            {participant.instagramUsername ? (
              <Text style={participantStyles.participantEmail}>
                @{participant.instagramUsername}
              </Text>
            ) : (
              <Text style={participantStyles.participantRole}>
                Participante
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={participantStyles.modernRemoveButton}
            onPress={() => onRemoveParticipant(participant.id)}
            activeOpacity={0.8}
          >
            <Text style={participantStyles.modernRemoveButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Agregar participante */}
      <View style={participantStyles.addParticipantSection}>
        <View style={participantStyles.addParticipantHeader}>
          <Text style={participantStyles.addParticipantTitle}>
            Agregar participante
          </Text>
          <Text style={participantStyles.addParticipantSubtitle}>
            Los participantes recibirán una notificación
          </Text>
        </View>

        <View style={participantStyles.modernInputGroup}>
          <View style={participantStyles.inputWrapper}>
            <View style={participantStyles.inputIconContainer}>
              <Text style={participantStyles.inputIcon}>👤</Text>
            </View>
            <View style={participantStyles.inputContent}>
              <Text style={participantStyles.modernInputLabel}>
                Nombre completo *
              </Text>
              <TextInput
                style={participantStyles.modernTextInput}
                placeholder="Ingresa el nombre del participante"
                value={newParticipantName}
                onChangeText={onParticipantNameChange}
                placeholderTextColor="#A0A0A0"
              />
            </View>
          </View>
          {errors.newParticipantName && (
            <Text style={participantStyles.modernErrorText}>
              {errors.newParticipantName}
            </Text>
          )}
        </View>

        <View style={participantStyles.modernInputGroup}>
          <View style={participantStyles.inputWrapper}>
            <View style={participantStyles.inputIconContainer}>
              <Text style={participantStyles.inputIcon}>📸</Text>
            </View>
            <View style={participantStyles.inputContent}>
              <Text style={participantStyles.modernInputLabel}>
                Instagram *
              </Text>
              <TextInput
                style={participantStyles.modernTextInput}
                placeholder="@usuario_instagram"
                value={newParticipantInstagram}
                onChangeText={onParticipantInstagramChange}
                placeholderTextColor="#A0A0A0"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={participantStyles.addParticipantButton}
          onPress={onAddParticipant}
          activeOpacity={0.8}
        >
          <Text style={participantStyles.addParticipantButtonIcon}>+</Text>
          <Text style={participantStyles.addParticipantButtonText}>
            Agregar Participante
          </Text>
        </TouchableOpacity>

        {errors.participants && (
          <Text style={participantStyles.modernErrorText}>
            {errors.participants}
          </Text>
        )}
      </View>
    </Card>
  );
};
