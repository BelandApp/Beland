import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { WalletBalanceCard } from "../Wallet/components/WalletBalanceCard";
import { useWalletData } from "../Wallet/hooks/useWalletData";

const ReceiveScreen = () => {
  const { walletData } = useWalletData();
  const alias = "usuario.alias";
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${alias}`;

  const [showToast, setShowToast] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(alias);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1600);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Este es mi alias para recibir pagos en Beland: ${alias}`,
        url: qrUrl,
        title: "Recibe pagos en Beland",
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir el alias.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Toast visual */}
      {showToast && (
        <View style={styles.toast}>
          <Ionicons
            name="checkmark-circle"
            size={22}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.toastText}>Alias copiado al portapapeles</Text>
        </View>
      )}
      {/* Header y saldo */}
      <WalletBalanceCard
        walletData={walletData}
        backgroundColor="#7DA244"
        accentColor="#fff"
      />

      <View style={styles.card}>
        <Text style={styles.label}>Tu alias:</Text>
        <View style={styles.aliasRow}>
          <Text style={styles.alias}>{alias}</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={22} color="#7DA244" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <MaterialCommunityIcons
              name="share-variant"
              size={22}
              color="#7DA244"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.infoText}>
          Comparte tu alias o el QR para recibir pagos de otros usuarios.
        </Text>
        <View style={styles.qrContainer}>
          <Image source={{ uri: qrUrl }} style={styles.qr} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 38,
    left: 0,
    right: 0,
    marginHorizontal: 32,
    backgroundColor: "#222",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    zIndex: 999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  toastText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: { flex: 1, backgroundColor: "#eaf1f8", padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 18,
    color: "#222",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 22,
    marginTop: 18,
    marginHorizontal: 2,
    elevation: 4,
    shadowColor: "#7DA244",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    alignItems: "center",
  },
  label: { fontSize: 16, color: "#555", marginBottom: 2 },
  aliasRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  alias: { fontSize: 19, fontWeight: "bold", color: "#222", marginRight: 8 },
  iconBtn: {
    marginHorizontal: 2,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#eaf1f8",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontSize: 13,
    color: "#888",
    marginBottom: 10,
    textAlign: "center",
  },
  qrContainer: { alignItems: "center", marginBottom: 0, marginTop: 8 },
  qr: { width: 180, height: 180, borderRadius: 12 },
});

export default ReceiveScreen;
