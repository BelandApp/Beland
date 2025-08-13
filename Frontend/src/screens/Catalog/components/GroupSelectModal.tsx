import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { Group } from "../../../types";
import { isUserAdminOfGroup } from "../../../utils/groupHelpers";

interface GroupSelectModalProps {
  visible: boolean;
  groups: Group[];
  onSelect: (group: Group) => void;
  onClose: () => void;
}

export const GroupSelectModal: React.FC<GroupSelectModalProps> = ({
  visible,
  groups,
  onSelect,
  onClose,
}) => {
  const [showSentMsg, setShowSentMsg] = React.useState(false);
  const [sentGroupName, setSentGroupName] = React.useState("");

  const handleSuggest = (group: Group) => {
    setSentGroupName(group.name);
    setShowSentMsg(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <Text style={styles.title}>
            Elegí un grupo para agregar los productos
          </Text>

          {showSentMsg ? (
            <View style={styles.sentMsgBox}>
              <Text style={styles.sentMsgTitle}>¡Sugerencia enviada!</Text>
              <Text style={styles.sentMsgText}>
                Tus productos fueron enviados como sugerencia al administrador
                del grupo{" "}
                <Text style={{ fontWeight: "bold", color: "#FF6B35" }}>
                  {sentGroupName}
                </Text>
                .
              </Text>
              <TouchableOpacity
                style={[styles.closeBtn, { marginTop: 18 }]}
                onPress={() => {
                  setShowSentMsg(false);
                  onClose();
                }}
              >
                <Text style={styles.closeBtnText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={groups}
              keyExtractor={(item) => item.id}
              style={{
                width: "100%",
                maxHeight: 340,
                backgroundColor: "transparent",
                marginBottom: 8,
              }}
              contentContainerStyle={{ paddingBottom: 20, width: "100%" }}
              showsVerticalScrollIndicator
              renderItem={({ item }) => {
                const isAdmin = isUserAdminOfGroup(item);
                return (
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 18,
                      marginBottom: 18,
                      paddingVertical: 18,
                      paddingHorizontal: 18,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 2,
                      borderWidth: isAdmin ? 2 : 1,
                      borderColor: isAdmin ? "#FF6B35" : "#E0E0E0",
                      flexDirection: "column",
                    }}
                    onPress={() =>
                      isAdmin ? onSelect(item) : handleSuggest(item)
                    }
                    activeOpacity={0.92}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#FF6B35",
                        marginBottom: 6,
                        letterSpacing: 0.2,
                      }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#666",
                        marginBottom: 8,
                        fontStyle: "italic",
                        lineHeight: 20,
                      }}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 2,
                      }}
                    >
                      <Text
                        style={{ fontSize: 13, color: "#999", marginRight: 10 }}
                      >
                        📍 {item.location}
                      </Text>
                      <Text
                        style={{ fontSize: 13, color: "#999", marginRight: 10 }}
                      >
                        ⏰ {item.deliveryTime}
                      </Text>
                      <Text style={{ fontSize: 13, color: "#999" }}>
                        👥 {item.participantsList.length}
                      </Text>
                    </View>
                    {!isAdmin && (
                      <View
                        style={{
                          marginTop: 10,
                          backgroundColor: "#FFF7E6",
                          borderRadius: 8,
                          padding: 8,
                          borderWidth: 1,
                          borderColor: "#FFD699",
                          alignSelf: "flex-start",
                          maxWidth: "100%",
                        }}
                      >
                        <Text
                          style={{
                            color: "#B26A00",
                            fontSize: 13,
                            fontWeight: "500",
                          }}
                        >
                          Los productos serán enviados como sugerencia al
                          administrador
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.empty}>No tienes grupos activos</Text>
              }
            />
          )}
          {!showSentMsg && (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 28,
    width: "94%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: "#FF6B35",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#FF6B35",
    textAlign: "center",
    letterSpacing: 0.3,
    textShadowColor: "#FFF3ED",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF6B35",
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  groupDesc: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    marginBottom: 2,
    fontStyle: "italic",
  },
  groupBtn: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    width: "100%",
    minHeight: 80,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1.5,
    flexDirection: "column",
  },
  adminGroup: {
    backgroundColor: "#FFF3ED",
    borderColor: "#FF6B35",
    opacity: 1,
  },
  suggestGroup: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E0E0E0",
    opacity: 0.85,
  },

  groupMeta: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  suggestionMsgBox: {
    marginTop: 8,
    backgroundColor: "#FFF7E6",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#FFD699",
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  suggestionMsg: {
    color: "#B26A00",
    fontSize: 13,
    fontWeight: "500",
  },
  closeBtn: {
    marginTop: 18,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  closeBtnText: {
    color: "#FF6B35",
    fontWeight: "bold",
    fontSize: 15,
  },
  empty: {
    color: "#888",
    textAlign: "center",
    marginTop: 24,
  },

  sentMsgBox: {
    backgroundColor: "#FFF7E6",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#FFD699",
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  sentMsgTitle: {
    color: "#FF6B35",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  sentMsgText: {
    color: "#B26A00",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 20,
  },
});
