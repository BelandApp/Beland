import React, { useState } from "react";
import { CustomAlert } from "../../components/ui/CustomAlert";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../hooks/AuthContext";
import { walletService } from "../../services/walletService";
import Constants from "expo-constants";
import { useWalletData } from "../Wallet/hooks/useWalletData";

const SendScreen = () => {
  const navigation = useNavigation();
  const { walletData, refetch } = useWalletData();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [currency] = useState("becoin");
  // Estados para CustomAlert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertAutoClose, setAlertAutoClose] = useState<number | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  // Para mostrar datos en la alerta de éxito
  const [sentAmount, setSentAmount] = useState("");
  const [sentCurrency, setSentCurrency] = useState("");
  const [sentAddress, setSentAddress] = useState("");

  // Verificar si usar modo demo
  const useDemoMode = Constants.expoConfig?.extra?.useDemoMode === "true";

  const validateTransfer = (): boolean => {
    const transferAmount = parseFloat(amount);

    if (!amount || isNaN(transferAmount) || transferAmount <= 0) {
      setAlertType("error");
      setAlertTitle("Error");
      setAlertMessage("Por favor ingresa un monto válido");
      setAlertAutoClose(2000);
      setAlertVisible(true);
      return false;
    }

    if (transferAmount > walletData.balance) {
      setAlertType("error");
      setAlertTitle("Error");
      setAlertMessage("Saldo insuficiente para realizar la transferencia");
      setAlertAutoClose(2000);
      setAlertVisible(true);
      return false;
    }

    if (!address.trim()) {
      setAlertType("error");
      setAlertTitle("Error");
      setAlertMessage("Por favor ingresa un alias o número de teléfono");
      setAlertAutoClose(2000);
      setAlertVisible(true);
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateTransfer()) return;

    setIsLoading(true);

    try {
      if (useDemoMode) {
        // Modo demo: simular transferencia
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSentAmount(amount);
        setSentCurrency(currency);
        setSentAddress(address);
        setAlertType("success");
        setAlertTitle("¡Transferencia Exitosa!");
        setAlertMessage(`Se han enviado ${amount} BECOINS a ${address}`);
        setAlertAutoClose(2000);
        setAlertVisible(true);
        // Actualizar datos de la wallet
        refetch();
      } else {
        // Modo producción: transferencia real usando nueva funcionalidad
        if (!user?.email) {
          setAlertType("error");
          setAlertTitle("Error");
          setAlertMessage("Usuario no autenticado");
          setAlertAutoClose(2000);
          setAlertVisible(true);
          return;
        }

        const amountNumber = parseFloat(amount);
        const recipientIdentifier = address.trim();

        try {
          // Solo BeCoins
          const result = await walletService.transferBetweenUsers(
            user.email,
            recipientIdentifier,
            amountNumber
          );

          if (result.isPending) {
            setAlertType("info");
            setAlertTitle("Invitación enviada");
            setAlertMessage(
              `Se ha enviado una invitación a ${recipientIdentifier}. Recibirá los BeCoins cuando se registre en la app.`
            );
            setAlertAutoClose(2500);
            setAlertVisible(true);
          } else {
            // Transferencia completada exitosamente
            setSentAmount(amount);
            setSentCurrency(currency);
            setSentAddress(address);
            setAlertType("success");
            setAlertTitle("¡Transferencia Exitosa!");
            setAlertMessage(`Se han enviado ${amount} BECOINS a ${address}`);
            setAlertAutoClose(2000);
            setAlertVisible(true);

            // Actualizar datos de la wallet
            refetch();
          }
        } catch (transferError: any) {
          console.error("Error en transferencia:", transferError);
          setAlertType("error");
          setAlertTitle("Error en transferencia");
          setAlertMessage(
            transferError.message ||
              "No se pudo completar la transferencia. Verifica los datos e intenta nuevamente."
          );
          setAlertAutoClose(2000);
          setAlertVisible(true);
        }
      }

      // Limpiar formulario
      setAmount("");
      setAddress("");
    } catch (error: any) {
      console.error("Error en transferencia:", error);
      setAlertType("error");
      setAlertTitle("Error en transferencia");
      setAlertMessage(
        error.message ||
          "No se pudo completar la transferencia. Intenta nuevamente."
      );
      setAlertAutoClose(2000);
      setAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // El modal de éxito se reemplaza por CustomAlert

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Enviar BeCoins</Text>
        </View>

        {/* Monto */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Monto a enviar (BeCoins)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              maxLength={10}
            />
            <View style={styles.currencySelector}>
              <Text style={styles.currencyText}>BECOINS</Text>
            </View>
          </View>
        </View>

        {/* Destinatario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Destinatario</Text>
          <View style={styles.recipientContainer}>
            <TextInput
              style={styles.recipientInput}
              placeholder="Alias o número de teléfono"
              value={address}
              onChangeText={setAddress}
              keyboardType="default"
            />
            <TouchableOpacity
              style={styles.qrButton}
              onPress={() => navigation.navigate("QR" as never)}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={24}
                color="#4ecdc4"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Información del saldo */}
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Saldo disponible:</Text>
          <Text style={styles.balanceAmount}>{walletData.balance} BECOINS</Text>
        </View>

        {/* Botón enviar */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { opacity: amount && address && !isLoading ? 1 : 0.5 },
          ]}
          disabled={!amount || !address || isLoading}
          onPress={handleSend}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? "ENVIANDO..." : "ENVIAR"}
          </Text>
        </TouchableOpacity>

        {/* El selector de moneda ha sido eliminado, solo se permite BeCoins */}
      </ScrollView>
      {/* CustomAlert para mostrar errores y éxito */}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        autoCloseDelay={alertAutoClose}
        onClose={() => {
          setAlertVisible(false);
          // Si fue éxito o invitación, volver atrás
          if (alertType === "success" || alertType === "info") {
            navigation.goBack();
          }
        }}
      />
    </>
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
    backgroundColor: "#4ecdc4",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    padding: 16,
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    marginRight: 4,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4ecdc4",
    marginRight: 4,
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipientInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 16,
  },
  qrButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: "#f0f9ff",
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
    color: "#4ecdc4",
  },
  sendButton: {
    backgroundColor: "#4ecdc4",
    margin: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#4ecdc4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  currencyOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  currencyOptionSelected: {
    backgroundColor: "#f0f9ff",
  },
  currencyOptionText: {
    fontSize: 16,
    color: "#333",
  },
  currencyOptionTextSelected: {
    fontWeight: "600",
    color: "#4ecdc4",
  },
  modalCloseButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: "#666",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4ecdc4",
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  closeButton: {
    backgroundColor: "#4ecdc4",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SendScreen;
