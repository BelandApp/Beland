import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../components/layout/RootStackNavigator";
import { walletService } from "../services/walletService";
import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, CameraView, BarcodeScanningResult } from "expo-camera";
import { colors } from "../styles/colors";
import { Button } from "../components/ui/Button";

export const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarcodeScanningResult) => {
    if (scanned) return;

    console.log("[QRScanner] Código escaneado:", data, "Tipo:", type);
    setScanned(true);
    setIsActive(false);
    setLoading(true);

    // Navegación automática tras escaneo
    (async () => {
      try {
        console.log("[QRScanner] Procesando wallet_id:", data);
        const paymentData = await walletService.getDataPayment(data);
        console.log("[QRScanner] Datos recibidos:", paymentData);
        // Si el QR tiene wallet_id y amount, es pago QR
        if (
          paymentData.wallet_id &&
          paymentData.amount &&
          Number(paymentData.amount) > 0
        ) {
          localStorage.setItem("payphone_is_qr_payment", "true");
          localStorage.setItem("payphone_to_wallet_id", paymentData.wallet_id);
        } else {
          localStorage.removeItem("payphone_is_qr_payment");
          localStorage.removeItem("payphone_to_wallet_id");
        }
        // Incluyo amount_to_payment_id en el objeto
        paymentData.amount_to_payment_id =
          paymentData.amount_to_payment_id ?? null;
        setLoading(false);
        navigation.navigate("PaymentScreen", { paymentData });
      } catch (err) {
        setLoading(false);
        console.error("[QRScanner] Error al obtener datos de pago:", err);
        Alert.alert("Error", "No se pudo obtener los datos de pago");
      }
    })();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.centerContent}>
          <Text style={styles.message}>Solicitando permisos de cámara...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView
        style={styles.container}
        edges={["bottom", "left", "right"]}
      >
        <View style={styles.centerContent}>
          <Text style={styles.message}>
            Necesitamos acceso a la cámara para escanear códigos QR
          </Text>
          <Button
            title="Solicitar permisos"
            onPress={async () => {
              const { status } = await Camera.requestCameraPermissionsAsync();
              setHasPermission(status === "granted");
            }}
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear QR</Text>
        <Text style={styles.subtitle}>
          Apunta la cámara hacia el código QR de la máquina de reciclaje
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        {isActive && (
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
          />
        )}

        {/* Overlay para mostrar el área de escaneo */}
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
          <Text style={styles.scanText}>
            Coloca el código QR dentro del marco
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={isActive ? "Pausar" : "Reanudar"}
          onPress={() => {
            setIsActive(!isActive);
            if (!isActive) {
              setScanned(false);
            }
          }}
          variant="secondary"
          style={styles.controlButton}
        />
      </View>

      {/* Loader visual cuando está cargando datos de pago */}
      {loading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderCard}>
            <Text style={styles.loaderText}>Procesando pago...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  loaderCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 40,
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    alignItems: "center",
  },
  loaderText: {
    fontSize: 20,
    color: "#007AFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    marginTop: 16,
  },
  cameraContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: colors.belandOrange,
    borderRadius: 20,
    backgroundColor: "rgba(248, 141, 42, 0.1)",
  },
  scanText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 20,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  footer: {
    padding: 20,
  },
  controlButton: {
    alignSelf: "center",
  },
});
