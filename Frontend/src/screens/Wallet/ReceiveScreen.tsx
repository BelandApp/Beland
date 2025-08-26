import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/AuthContext";
import { useWalletData } from "../Wallet/hooks/useWalletData";
import { walletService } from "../../services/walletService";

const ReceiveScreen = () => {
  const navigation = useNavigation();
  const { walletData } = useWalletData();
  const { user } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  // Usar solo el alias que venga del backend
  const alias = walletData?.alias;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(alias ?? "");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1600);
  };

  const [aliasLoadingDots, setAliasLoadingDots] = useState(0);
  useEffect(() => {
    if (!alias) {
      const interval = setInterval(() => {
        setAliasLoadingDots((prev) => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setAliasLoadingDots(0);
    }
  }, [alias]);
  const handleShare = async () => {
    try {
      const userName = user?.name || "Usuario";
      await Share.share({
        message: `¡Hola! Soy ${userName} y este es mi alias para recibir pagos en Beland: ${alias}`,
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo compartir el alias");
    }
  };

  useEffect(() => {
    const fetchQr = async () => {
      if (user?.id) {
        setQrLoading(true);
        setQrError(null);
        try {
          const qr = await walletService.getWalletQR();
          if (qr) {
            setQrImage(qr);
          } else {
            setQrError("No se pudo obtener el QR");
          }
        } catch (err) {
          setQrError("Error al obtener el QR");
        } finally {
          setQrLoading(false);
        }
      }
    };
    fetchQr();
  }, [user?.id]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Recibir BeCoins</Text>
      </View>

      {/* Solo mostrar QR si el usuario es comerciante */}
      {user?.role === "COMMERCE" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Código QR</Text>
          <View style={styles.qrContainer}>
            <View style={styles.qrCodeWrapper}>
              {qrLoading ? (
                <ActivityIndicator size="large" color="#7DA244" />
              ) : qrImage ? (
                <Image
                  source={{ uri: qrImage }}
                  style={{ width: 180, height: 180, borderRadius: 12 }}
                  resizeMode="contain"
                />
              ) : (
                <Text style={{ color: "#FF6347" }}>
                  {qrError || "No se pudo cargar el QR"}
                </Text>
              )}
            </View>

            {Platform.OS === "web" ? (
              <a
                href={qrImage ?? undefined}
                download={`qr-beland-${Date.now()}.png`}
                style={{
                  backgroundColor: "#7DA244",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  textDecoration: "none",
                  fontFamily: "sans-serif",
                }}
              >
                <MaterialCommunityIcons
                  name="download"
                  size={20}
                  color="#fff"
                />
                <span style={{ color: "#fff", marginLeft: 8 }}>
                  Descargar QR
                </span>
              </a>
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: "#7DA244",
                  padding: 10,
                  borderRadius: 8,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={async () => {
                  if (!qrImage) return;
                  try {
                    const FileSystem = require("expo-file-system");
                    const filename = `qr-beland-${Date.now()}.png`;
                    const downloadResumable = FileSystem.downloadAsync(
                      qrImage,
                      FileSystem.documentDirectory + filename
                    );
                    await downloadResumable;
                    Alert.alert(
                      "Descarga exitosa",
                      "El QR se guardó en tus archivos."
                    );
                  } catch (err) {
                    Alert.alert("Error", "No se pudo descargar el QR");
                  }
                }}
              >
                <MaterialCommunityIcons
                  name="download"
                  size={20}
                  color="#fff"
                />
                <Text style={{ color: "#fff", marginLeft: 8 }}>
                  Descargar QR
                </Text>
              </TouchableOpacity>
            )}
            {/* Fin del botón de descarga */}
            <Text style={styles.qrDescription}>
              Comparte este código QR para recibir pagos o transferencias
            </Text>
          </View>
        </View>
      )}

      {/* Alias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tu alias</Text>
        <View style={styles.aliasContainer}>
          <Text style={styles.aliasText}>
            {alias ?? `Cargando alias${".".repeat(aliasLoadingDots)}`}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
            <MaterialCommunityIcons
              name="content-copy"
              size={20}
              color="#7DA244"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Información del saldo */}
      <View style={styles.balanceInfo}>
        <Text style={styles.balanceLabel}>Saldo actual:</Text>
        <Text style={styles.balanceAmount}>{walletData.balance} BECOINS</Text>
      </View>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
          <Text style={styles.shareButtonText}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {/* Toast de copiado */}
      {showToast && (
        <View style={styles.toast}>
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={styles.toastText}>¡Alias copiado!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: "#7DA244",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  qrContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
  },
  qrDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  aliasContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  aliasText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f0f9f0",
  },
  balanceInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7DA244",
  },
  actionButtons: {
    margin: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7DA244",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#7DA244",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  toast: {
    position: "absolute",
    bottom: 100,
    left: "50%",
    transform: [{ translateX: -60 }],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default ReceiveScreen;
