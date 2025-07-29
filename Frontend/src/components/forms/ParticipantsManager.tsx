import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Button } from "../ui/Button";
import { AddParticipantModal } from "../ui/AddParticipantModal";
import { Participant } from "../../types";
import { InstagramUser } from "../../services/instagramService";
import { formStyles, commonStyles } from "../../styles";
import { colors } from "../../styles/colors";

interface ParticipantsManagerProps {
  participants: Participant[];
  onAddParticipant: (name: string, instagramUser: InstagramUser) => void;
  onRemoveParticipant: (id: string) => void;
  participantErrors?: {
    name?: string;
    instagram?: string;
  };
}

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  participantErrors,
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleAddParticipant = (name: string, instagramUser: InstagramUser) => {
    onAddParticipant(name, instagramUser);
    // Solo cerrar modal si no hay errores
    if (!participantErrors?.name && !participantErrors?.instagram) {
      setShowModal(false);
    }
  };
  return (
    <>
      <Text style={commonStyles.cardTitle}>
        Participantes ({participants.length + 1})
      </Text>
      <Text style={commonStyles.cardSubtitle}>
        Tú estás incluido automáticamente
      </Text>

      {/* Lista de participantes */}
      {participants.map((participant) => (
        <View key={participant.id} style={participantStyles.participantItem}>
          <View style={participantStyles.participantInfo}>
            <Text style={participantStyles.participantName}>
              {participant.name}
            </Text>
            {participant.instagramUsername ? (
              <Text style={participantStyles.participantEmail}>
                @{participant.instagramUsername}
              </Text>
            ) : (
              <Text style={participantStyles.participantEmail}>
                Sin Instagram
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={participantStyles.removeButton}
            onPress={() => onRemoveParticipant(participant.id)}
          >
            <Text style={participantStyles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Agregar participante */}
      <View style={formStyles.addParticipantContainer}>
        <Button
          title="+ Agregar Participante"
          onPress={() => setShowModal(true)}
          variant="secondary"
        />
      </View>

      {/* Modal para agregar participante */}
      <AddParticipantModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAddParticipant={handleAddParticipant}
        errors={participantErrors}
      />
    </>
  );
};

const participantStyles = {
  participantItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: "#333333",
  },
  participantEmail: {
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFEBEE",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  removeButtonText: {
    color: "#F44336",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
};
