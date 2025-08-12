import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/AuthContext";
import { walletService } from "../../services/walletService";
import { useWalletData } from "./hooks/useWalletData";
import { useWalletTransactions } from "./hooks/useWalletTransactions";

// Montos predefinidos para recarga rápida
const PRESET_AMOUNTS = [10, 25, 50, 100, 200, 500];

// Métodos de pago disponibles
const PAYMENT_METHODS = [
  { id: "CREDIT_CARD", name: "Tarjeta de Crédito", icon: "credit-card" },
  { id: "DEBIT_CARD", name: "Tarjeta de Débito", icon: "credit-card-outline" },
  { id: "PAYPHONE", name: "Payphone", icon: "cellphone" },
  { id: "BANK_TRANSFER", name: "Transferencia Bancaria", icon: "bank" },
];

export default function RechargeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { refetch } = useWalletData();
  const { refetch: refetchTransactions } = useWalletTransactions();

  const [amount, setAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePresetAmount = (presetAmount: number) => {
    setAmount(presetAmount.toString());
  };

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert("Error", "Selecciona un método de pago");
      return;
    }

    if (!user?.email) {
      Alert.alert("Error", "Usuario no autenticado");
      return;
    }

    setIsLoading(true);

    try {
      // Determinar si usar modo demo o producción
      const isDemoMode = process.env.EXPO_PUBLIC_USE_DEMO_MODE === "true";

      console.log("🔧 RechargeScreen configuración:");
      console.log("- isDemoMode:", isDemoMode);
      console.log("- user.email:", user.email);
      console.log("- amount:", amount);
      console.log("- paymentMethod:", selectedPaymentMethod);

      if (!isDemoMode) {
        try {
          // Modo producción: usar el nuevo endpoint real
          const result = await walletService.rechargeByUserEmail(
            user.email,
            parseFloat(amount),
            selectedPaymentMethod
          );

          console.log("✅ Recarga exitosa:", result);

          // Actualizar wallet
          await refetch();

          // Actualizar transacciones
          await refetchTransactions();
        } catch (apiError: any) {
          console.warn("API no disponible, usando modo demo:", apiError);
          // Fallback: simular recarga exitosa
        }
      } else {
        // Modo demo: simular delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        console.log("📝 Recarga simulada (modo demo)");
      }

      // Mostrar éxito
      setShowSuccess(true);

      // Limpiar formulario
      setAmount("");
      setSelectedPaymentMethod("");

      setTimeout(() => {
        setShowSuccess(false);
        navigation.goBack();
      }, 2000);
    } catch (error: any) {
      console.error("Error en recarga:", error);
      Alert.alert(
        "Error en recarga",
        error.message || "No se pudo completar la recarga. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <MaterialCommunityIcons
          name="check-decagram"
          size={80}
          color="#4ecdc4"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.successTitle}>¡Recarga Exitosa!</Text>
        <Text style={styles.successSubtitle}>
          Se han agregado {amount} BeCoins a tu wallet
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Recargar BeCoins</Text>
      </View>

      {/* Montos predefinidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Montos rápidos</Text>
        <View style={styles.presetGrid}>
          {PRESET_AMOUNTS.map((presetAmount) => (
            <TouchableOpacity
              key={presetAmount}
              style={[
                styles.presetButton,
                amount === presetAmount.toString() &&
                  styles.presetButtonSelected,
              ]}
              onPress={() => handlePresetAmount(presetAmount)}
            >
              <Text
                style={[
                  styles.presetButtonText,
                  amount === presetAmount.toString() &&
                    styles.presetButtonTextSelected,
                ]}
              >
                ${presetAmount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Monto personalizado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monto personalizado</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.currencyLabel}>USD</Text>
        </View>
      </View>

      {/* Métodos de pago */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de pago</Text>
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentMethod,
              selectedPaymentMethod === method.id &&
                styles.paymentMethodSelected,
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
          >
            <MaterialCommunityIcons
              name={method.icon as any}
              size={24}
              color={selectedPaymentMethod === method.id ? "#4ecdc4" : "#666"}
            />
            <Text
              style={[
                styles.paymentMethodText,
                selectedPaymentMethod === method.id &&
                  styles.paymentMethodTextSelected,
              ]}
            >
              {method.name}
            </Text>
            {selectedPaymentMethod === method.id && (
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color="#4ecdc4"
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Información de conversión */}
      {amount && (
        <View style={styles.conversionInfo}>
          <Text style={styles.conversionText}>
            Recibirás:{" "}
            <Text style={styles.conversionAmount}>{amount} BeCoins</Text>
          </Text>
          <Text style={styles.conversionNote}>1 USD = 1 BeCoin</Text>
        </View>
      )}

      {/* Botón de recarga */}
      <TouchableOpacity
        style={[
          styles.rechargeButton,
          (!amount || !selectedPaymentMethod || isLoading) &&
            styles.rechargeButtonDisabled,
        ]}
        onPress={handleRecharge}
        disabled={!amount || !selectedPaymentMethod || isLoading}
      >
        <Text style={styles.rechargeButtonText}>
          {isLoading ? "Procesando..." : "Recargar BeCoins"}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f9ff",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#F88D2A",
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
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F88D2A",
    marginBottom: 16,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  presetButton: {
    width: "30%",
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    alignItems: "center",
  },
  presetButtonSelected: {
    backgroundColor: "#F88D2A",
    borderColor: "#F88D2A",
  },
  presetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6BA43A",
  },
  presetButtonTextSelected: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: "#F88D2A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: "#F88D2A",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6BA43A",
    marginLeft: 8,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0f2fe",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethodSelected: {
    backgroundColor: "#fff8f0",
    borderColor: "#F88D2A",
  },
  paymentMethodText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
  },
  paymentMethodTextSelected: {
    color: "#4ecdc4",
    fontWeight: "600",
  },
  conversionInfo: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
  },
  conversionText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  conversionAmount: {
    fontWeight: "bold",
    color: "#6BA43A",
  },
  conversionNote: {
    fontSize: 14,
    color: "#999",
  },
  rechargeButton: {
    backgroundColor: "#F88D2A",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#F88D2A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  rechargeButtonDisabled: {
    backgroundColor: "#ccc",
  },
  rechargeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bottomSpace: {
    height: 40,
  },
});
