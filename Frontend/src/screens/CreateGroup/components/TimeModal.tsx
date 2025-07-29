import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { modalStyles } from "../styles";

interface TimeModalProps {
  visible: boolean;
  selectedHour: string;
  selectedMinute: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export const TimeModal: React.FC<TimeModalProps> = ({
  visible,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
  onConfirm,
  onClose,
}) => {
  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      options.push(hour);
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i++) {
      const minute = i.toString().padStart(2, "0");
      options.push(minute);
    }
    return options;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.timeModalOverlay}>
        <View style={modalStyles.timeModalContent}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>
              Seleccionar Horario de Entrega
            </Text>
            <TouchableOpacity
              style={modalStyles.modalCloseButton}
              onPress={onClose}
            >
              <Text style={modalStyles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={modalStyles.timePickerContainer}>
            <View style={modalStyles.timeSection}>
              <Text style={modalStyles.timeSectionTitle}>
                🕐 Hora de entrega
              </Text>
              <View style={modalStyles.timePickerRow}>
                <ScrollView
                  style={modalStyles.timePicker}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={modalStyles.timePickerContent}
                >
                  {generateTimeOptions().map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        modalStyles.timeOption,
                        selectedHour === hour && modalStyles.timeOptionSelected,
                      ]}
                      onPress={() => onHourChange(hour)}
                    >
                      <Text
                        style={[
                          modalStyles.timeOptionText,
                          selectedHour === hour &&
                            modalStyles.timeOptionTextSelected,
                        ]}
                      >
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={modalStyles.timeSeparator}>:</Text>

                <ScrollView
                  style={modalStyles.timePicker}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={modalStyles.timePickerContent}
                >
                  {generateMinuteOptions().map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        modalStyles.timeOption,
                        selectedMinute === minute &&
                          modalStyles.timeOptionSelected,
                      ]}
                      onPress={() => onMinuteChange(minute)}
                    >
                      <Text
                        style={[
                          modalStyles.timeOptionText,
                          selectedMinute === minute &&
                            modalStyles.timeOptionTextSelected,
                        ]}
                      >
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={modalStyles.timePreview}>
              <Text style={modalStyles.timePreviewLabel}>
                Horario de entrega:
              </Text>
              <Text style={modalStyles.timePreviewText}>
                {selectedHour}:{selectedMinute}
              </Text>
            </View>

            <TouchableOpacity
              style={modalStyles.confirmTimeButton}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={modalStyles.confirmTimeButtonText}>
                Confirmar Horario
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
