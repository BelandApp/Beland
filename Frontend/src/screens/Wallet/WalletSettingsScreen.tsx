import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/AuthContext";
import { walletService, Wallet } from "../../services/walletService";
import { useWalletData } from "./hooks/useWalletData";

export default function WalletSettingsScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { fullWalletData, refetch } = useWalletData();

  const [alias, setAlias] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (fullWalletData?.alias) {
      setAlias(fullWalletData.alias);
    }
  }, [fullWalletData]);

  const handleUpdateAlias = async () => {
    if (!alias.trim()) {
      Alert.alert("Error", "El alias no puede estar vacío");
      return;
    }

    if (!fullWalletData?.id) {
      Alert.alert("Error", "No se encontró la wallet");
      return;
    }

    setIsLoading(true);

    try {
      await walletService.updateWallet(fullWalletData.id, {
        alias: alias.trim(),
      });

      Alert.alert("Éxito", "Alias actualizado correctamente");
      await refetch();
    } catch (error: any) {
      console.error("Error actualizando alias:", error);
      Alert.alert("Error", error.message || "No se pudo actualizar el alias");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQR = () => {
    // Esta funcionalidad se implementaría con una biblioteca de QR
    Alert.alert(
      "Código QR",
      "Funcionalidad de QR en desarrollo. Se implementará próximamente."
    );
  };

  const handleBackup = () => {
    Alert.alert(
      "Respaldo de Wallet",
      "¿Quieres crear un respaldo de tu wallet? Esto te permitirá recuperarla en caso de pérdida del dispositivo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Crear Respaldo",
          onPress: () => {
            Alert.alert(
              "En desarrollo",
              "Funcionalidad próximamente disponible"
            );
          },
        },
      ]
    );
  };

  const handleDeleteWallet = () => {
    Alert.alert(
      "⚠️ Eliminar Wallet",
      "Esta acción no se puede deshacer. Perderás todos tus BeCoins y no podrás recuperarlos. ¿Estás seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "En desarrollo",
              "Funcionalidad próximamente disponible"
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración de Wallet</Text>
      </View>

      {/* Información de la wallet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de la Wallet</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID de Wallet</Text>
          <Text style={styles.infoValue}>
            {fullWalletData?.id?.slice(0, 8)}...
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Creada el</Text>
          <Text style={styles.infoValue}>
            {fullWalletData?.created_at
              ? new Date(fullWalletData.created_at).toLocaleDateString()
              : "-"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Balance Bloqueado</Text>
          <Text style={styles.infoValue}>
            {fullWalletData?.locked_balance || 0} BeCoins
          </Text>
        </View>
      </View>

      {/* Configuración del alias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alias de la Wallet</Text>
        <Text style={styles.sectionSubtitle}>
          Tu alias es como otras personas pueden encontrarte para enviarte
          BeCoins
        </Text>

        <View style={styles.aliasContainer}>
          <TextInput
            style={styles.aliasInput}
            placeholder="Mi alias"
            value={alias}
            onChangeText={setAlias}
            maxLength={20}
          />
          <TouchableOpacity
            style={[
              styles.updateButton,
              isLoading && styles.updateButtonDisabled,
            ]}
            onPress={handleUpdateAlias}
            disabled={isLoading}
          >
            <Text style={styles.updateButtonText}>
              {isLoading ? "..." : "Actualizar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Configuraciones de notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Notificaciones Push</Text>
            <Text style={styles.settingSubtitle}>
              Recibir notificaciones de transacciones
            </Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: "#ccc", true: "#4ecdc4" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Bloqueo Automático</Text>
            <Text style={styles.settingSubtitle}>
              Bloquear wallet después de inactividad
            </Text>
          </View>
          <Switch
            value={autoLock}
            onValueChange={setAutoLock}
            trackColor={{ false: "#ccc", true: "#4ecdc4" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Herramientas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Herramientas</Text>

        <TouchableOpacity style={styles.toolButton} onPress={handleGenerateQR}>
          <MaterialCommunityIcons name="qrcode" size={24} color="#4ecdc4" />
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Código QR</Text>
            <Text style={styles.toolSubtitle}>
              Generar QR para recibir pagos
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.toolButton} onPress={handleBackup}>
          <MaterialCommunityIcons
            name="backup-restore"
            size={24}
            color="#4ecdc4"
          />
          <View style={styles.toolInfo}>
            <Text style={styles.toolTitle}>Respaldo de Wallet</Text>
            <Text style={styles.toolSubtitle}>Crear copia de seguridad</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Zona de peligro */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: "#e74c3c" }]}>
          Zona de Peligro
        </Text>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={handleDeleteWallet}
        >
          <MaterialCommunityIcons name="delete" size={24} color="#e74c3c" />
          <View style={styles.toolInfo}>
            <Text style={[styles.toolTitle, { color: "#e74c3c" }]}>
              Eliminar Wallet
            </Text>
            <Text style={styles.toolSubtitle}>
              Esta acción no se puede deshacer
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  aliasContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  aliasInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginRight: 12,
  },
  updateButton: {
    backgroundColor: "#4ecdc4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  updateButtonDisabled: {
    backgroundColor: "#ccc",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  toolInfo: {
    flex: 1,
    marginLeft: 16,
  },
  toolTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  bottomSpace: {
    height: 40,
  },
});
