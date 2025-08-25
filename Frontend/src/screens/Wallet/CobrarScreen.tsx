import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  FlatList,
  Alert,
  Image,
} from "react-native";

import { walletService } from "../../services/walletService";
import { useNavigation } from "@react-navigation/native";

const CobrarScreen = () => {
  const navigation = useNavigation();
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [amounts, setAmounts] = useState<any[]>([]);
  const [loadingAmounts, setLoadingAmounts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [presetAmount, setPresetAmount] = useState("");
  const [presetName, setPresetName] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  const IS_WEB = Platform.OS && String(Platform.OS).toLowerCase() === "web";

  // Componente auxiliar para renderizar <a> en web con icono
  const WebDownloadButton = ({ qrImage }: { qrImage: string }) => {
    if (!qrImage) return null;
    return (
      <a
        href={qrImage}
        download={`qr-beland-${Date.now()}.png`}
        style={{
          backgroundColor: "#FFD700",
          padding: 10,
          borderRadius: 8,
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          fontFamily: "sans-serif",
        }}
      >
        {/* @ts-ignore */}
        <span style={{ display: "flex", alignItems: "center" }}>
          {/* @ts-ignore */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 8 }}
          >
            <path
              d="M5 20h14a1 1 0 0 0 1-1v-2a1 1 0 0 0-2 0v1H6v-1a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1zm7-2a1 1 0 0 0 1-1V7a1 1 0 0 0-2 0v10a1 1 0 0 0 1 1zm-4.293-4.707a1 1 0 0 0 1.414 1.414L12 13.414l2.879 2.879a1 1 0 0 0 1.414-1.414l-4-4a1 1 0 0 0-1.414 0z"
              fill="#fff"
            />
          </svg>
          <span style={{ color: "#fff" }}>Descargar QR</span>
        </span>
      </a>
    );
  };

  useEffect(() => {
    const fetchQr = async () => {
      setQrLoading(true);
      setQrError(null);
      try {
        const qr = await walletService.getWalletQR();
        setQrImage(qr);
      } catch (err) {
        setQrError("Error al obtener el QR");
      } finally {
        setQrLoading(false);
      }
    };
    fetchQr();
  }, []);

  const fetchAmounts = async () => {
    setLoadingAmounts(true);
    try {
      const res = await walletService.getAmountsToPayment();
      console.log("[CobrarScreen] Montos obtenidos:", res);
      setAmounts(Array.isArray(res) ? res[0] : res || []);
    } catch (err) {
      console.error("[CobrarScreen] Error al obtener montos:", err);
      Alert.alert("Error", "No se pudieron cargar los montos");
    } finally {
      setLoadingAmounts(false);
    }
  };

  useEffect(() => {
    fetchAmounts();
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    setLoadingPresets(true);
    try {
      const res = await walletService.getPresetAmounts();
      setPresets(Array.isArray(res) ? res[0] : res || []);
    } catch (err) {
      console.error("[CobrarScreen] Error al obtener presets:", err);
    } finally {
      setLoadingPresets(false);
    }
  };

  const handleCreatePreset = async () => {
    if (!presetName || presetName.length < 2) {
      Alert.alert("Error", "Ingresa un nombre para el preset");
      return;
    }
    if (
      !presetAmount ||
      isNaN(Number(presetAmount)) ||
      Number(presetAmount) <= 0
    ) {
      Alert.alert("Error", "Ingresa un monto válido para el preset");
      return;
    }
    try {
      await walletService.createPresetAmount({
        name: presetName,
        amount: Number(presetAmount),
        message: presetMessage,
      });
      setPresetAmount("");
      setPresetName("");
      setPresetMessage("");
      fetchPresets();
    } catch (err) {
      Alert.alert("Error", "No se pudo crear el preset");
    }
  };

  const handleCreateAmount = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    setCreating(true);
    try {
      await walletService.createAmountToPayment(Number(amount));
      setAmount("");
      fetchAmounts();
    } catch (err) {
      Alert.alert("Error", "No se pudo crear el monto");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAmount = async (id: string) => {
    console.log("[CobrarScreen] Intentando eliminar monto con id:", id);
    try {
      await walletService.deleteAmountToPayment(id);
      console.log("[CobrarScreen] Monto eliminado correctamente");
      fetchAmounts();
    } catch (err) {
      console.error("[CobrarScreen] Error al eliminar monto:", err);
      Alert.alert("Error", "No se pudo eliminar el monto");
    }
  };

  if (Platform.OS === "web") {
    return (
      <div
        style={{
          height: "100vh",
          overflowY: "auto",
          background: "#F7F8FA",
        }}
      >
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>{"<"}</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Cobrar BeCoins</Text>
          {/* Presets de monto */}
          <View
            style={{
              marginTop: 16,
              backgroundColor: "#f7fbfc",
              borderColor: "#00bcd4",
              borderWidth: 1,
              borderRadius: 16,
              shadowColor: "#00bcd4",
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 2,
              paddingBottom: 18,
              margin: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                color: "#00bcd4",
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              Presets de monto rápido
            </Text>
            {loadingPresets ? (
              <ActivityIndicator size="small" color="#00bcd4" />
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {presets.map((preset, idx) => (
                  <TouchableOpacity
                    key={preset.id}
                    style={{
                      backgroundColor: "#e0f7fa",
                      borderRadius: 20,
                      paddingVertical: 10,
                      paddingHorizontal: 22,
                      margin: 4,
                      borderWidth: 2,
                      borderColor: "#00bcd4",
                      shadowColor: "#00bcd4",
                      shadowOpacity: 0.12,
                      shadowRadius: 4,
                      elevation: 2,
                      marginRight: idx % 2 === 0 ? 8 : 0,
                      marginBottom: 8,
                    }}
                    onPress={() => setAmount(String(preset.amount))}
                  >
                    <Text
                      style={{
                        color: "#007AFF",
                        fontWeight: "bold",
                        fontSize: 16,
                        letterSpacing: 0.5,
                      }}
                    >
                      {preset.name || preset.amount} BeCoins
                    </Text>
                    {preset.message ? (
                      <Text
                        style={{
                          color: "#0097a7",
                          fontSize: 12,
                          marginTop: 2,
                          textAlign: "center",
                        }}
                      >
                        {preset.message}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ marginTop: 8 }}>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#00bcd4",
                  borderRadius: 10,
                  padding: 10,
                  backgroundColor: "#fff",
                  fontSize: 16,
                  marginBottom: 8,
                }}
                placeholder="Nombre del preset"
                value={presetName}
                onChangeText={setPresetName}
              />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#00bcd4",
                  borderRadius: 10,
                  padding: 10,
                  backgroundColor: "#fff",
                  fontSize: 16,
                  marginBottom: 8,
                }}
                placeholder="Monto"
                keyboardType="numeric"
                value={presetAmount}
                onChangeText={setPresetAmount}
              />
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: "#00bcd4",
                  borderRadius: 10,
                  padding: 10,
                  backgroundColor: "#fff",
                  fontSize: 16,
                  marginBottom: 8,
                }}
                placeholder="Mensaje (opcional)"
                value={presetMessage}
                onChangeText={setPresetMessage}
              />
              <TouchableOpacity
                style={{
                  backgroundColor: "#00bcd4",
                  paddingVertical: 10,
                  paddingHorizontal: 24,
                  borderRadius: 10,
                  alignItems: "center",
                  marginTop: 4,
                }}
                onPress={handleCreatePreset}
              >
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}
                >
                  Agregar preset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Input de monto y botón */}
          <View style={[styles.section, styles.amountSection]}>
            <Text
              style={[styles.sectionTitle, { color: "#007AFF", fontSize: 18 }]}
            >
              1. Ingresa el monto a cobrar
            </Text>
            <View style={[styles.row, { marginTop: 12 }]}>
              <TextInput
                style={styles.input}
                placeholder="Monto en BeCoins"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateAmount}
                disabled={creating}
              >
                <Text style={styles.buttonText}>
                  {creating ? "Guardando..." : "Crear Venta"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* QR para cobrar */}
          <View style={[styles.section, styles.qrSection]}>
            <Text
              style={[styles.sectionTitle, { color: "#FFD700", fontSize: 18 }]}
            >
              2. QR para cobrar
            </Text>
            {qrLoading ? (
              <ActivityIndicator size="large" color="#FFD700" />
            ) : qrImage ? (
              <>
                <Image source={{ uri: qrImage }} style={styles.qrImage} />
                <WebDownloadButton qrImage={qrImage} />
              </>
            ) : (
              <Text style={styles.errorText}>{qrError}</Text>
            )}
            <Text style={styles.qrHint}>
              El cliente debe escanear este QR para pagar el monto ingresado.
            </Text>
          </View>
          {/* Montos creados */}
          <View style={[styles.section, styles.createdSection]}>
            <Text style={styles.sectionTitle}>Historial de montos creados</Text>
            {loadingAmounts ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <View>
                {amounts && amounts.length > 0 ? (
                  amounts.map((item, idx) => (
                    <View style={styles.amountRow} key={item.id || idx}>
                      <View>
                        <Text style={styles.amountText}>
                          {item.amount} BeCoins
                        </Text>
                        <Text style={styles.amountDate}>
                          {new Date(item.created_at).toLocaleString()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteAmount(item.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteText}>Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text
                    style={{ textAlign: "center", color: "#888", marginTop: 8 }}
                  >
                    No hay montos creados.
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </div>
    );
  }
  // Mobile y otros
  return (
    <ScrollView style={styles.container}>
      {/* ...existing code... */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Cobrar BeCoins</Text>
      {/* Presets de monto */}
      <View
        style={{
          marginTop: 16,
          backgroundColor: "#f7fbfc",
          borderColor: "#00bcd4",
          borderWidth: 1,
          borderRadius: 16,
          shadowColor: "#00bcd4",
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
          paddingBottom: 18,
          margin: 16,
          padding: 16,
        }}
      >
        <Text
          style={{
            color: "#00bcd4",
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
            letterSpacing: 0.5,
          }}
        >
          Presets de monto rápido
        </Text>
        {loadingPresets ? (
          <ActivityIndicator size="small" color="#00bcd4" />
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            {presets.map((preset, idx) => (
              <TouchableOpacity
                key={preset.id}
                style={{
                  backgroundColor: "#e0f7fa",
                  borderRadius: 20,
                  paddingVertical: 10,
                  paddingHorizontal: 22,
                  margin: 4,
                  borderWidth: 2,
                  borderColor: "#00bcd4",
                  shadowColor: "#00bcd4",
                  shadowOpacity: 0.12,
                  shadowRadius: 4,
                  elevation: 2,
                  marginRight: idx % 2 === 0 ? 8 : 0,
                  marginBottom: 8,
                }}
                onPress={() => setAmount(String(preset.amount))}
              >
                <Text
                  style={{
                    color: "#007AFF",
                    fontWeight: "bold",
                    fontSize: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {preset.name || preset.amount} BeCoins
                </Text>
                {preset.message ? (
                  <Text
                    style={{
                      color: "#0097a7",
                      fontSize: 12,
                      marginTop: 2,
                      textAlign: "center",
                    }}
                  >
                    {preset.message}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ marginTop: 8 }}>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#00bcd4",
              borderRadius: 10,
              padding: 10,
              backgroundColor: "#fff",
              fontSize: 16,
              marginBottom: 8,
            }}
            placeholder="Nombre del preset"
            value={presetName}
            onChangeText={setPresetName}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#00bcd4",
              borderRadius: 10,
              padding: 10,
              backgroundColor: "#fff",
              fontSize: 16,
              marginBottom: 8,
            }}
            placeholder="Monto"
            keyboardType="numeric"
            value={presetAmount}
            onChangeText={setPresetAmount}
          />
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#00bcd4",
              borderRadius: 10,
              padding: 10,
              backgroundColor: "#fff",
              fontSize: 16,
              marginBottom: 8,
            }}
            placeholder="Mensaje (opcional)"
            value={presetMessage}
            onChangeText={setPresetMessage}
          />
          <TouchableOpacity
            style={{
              backgroundColor: "#00bcd4",
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 10,
              alignItems: "center",
              marginTop: 4,
            }}
            onPress={handleCreatePreset}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
              Agregar preset
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Input de monto y botón */}
      <View style={[styles.section, styles.amountSection]}>
        <Text style={[styles.sectionTitle, { color: "#007AFF", fontSize: 18 }]}>
          1. Ingresa el monto a cobrar
        </Text>
        <View style={[styles.row, { marginTop: 12 }]}>
          <TextInput
            style={styles.input}
            placeholder="Monto en BeCoins"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateAmount}
            disabled={creating}
          >
            <Text style={styles.buttonText}>
              {creating ? "Guardando..." : "Crear Venta"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* QR para cobrar */}
      <View style={[styles.section, styles.qrSection]}>
        <Text style={[styles.sectionTitle, { color: "#FFD700", fontSize: 18 }]}>
          2. QR para cobrar
        </Text>
        {qrLoading ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : qrImage ? (
          <>
            <Image source={{ uri: qrImage }} style={styles.qrImage} />
            {IS_WEB ? (
              <WebDownloadButton qrImage={qrImage} />
            ) : (
              <TouchableOpacity
                style={{
                  backgroundColor: "#FFD700",
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
                <Text style={{ color: "#fff", marginLeft: 8 }}>
                  Descargar QR
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.errorText}>{qrError}</Text>
        )}
        <Text style={styles.qrHint}>
          El cliente debe escanear este QR para pagar el monto ingresado.
        </Text>
      </View>
      {/* Montos creados */}
      <View style={[styles.section, styles.createdSection]}>
        <Text style={styles.sectionTitle}>Historial de montos creados</Text>
        {loadingAmounts ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <View>
            {amounts && amounts.length > 0 ? (
              amounts.map((item, idx) => (
                <View style={styles.amountRow} key={item.id || idx}>
                  <View>
                    <Text style={styles.amountText}>{item.amount} BeCoins</Text>
                    <Text style={styles.amountDate}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteAmount(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text
                style={{ textAlign: "center", color: "#888", marginTop: 8 }}
              >
                No hay montos creados.
              </Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F7F8FA",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 12,
  },
  backText: {
    fontSize: 22,
    color: "#007AFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007AFF",
  },
  qrImage: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  errorText: {
    color: "#E53E3E",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    backgroundColor: "#f7f7f7",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f7f7f7",
    borderRadius: 8,
    marginVertical: 4,
    padding: 12,
  },
  amountText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    color: "#E53E3E",
    fontSize: 13,
  },
  presetsSection: {
    marginTop: 16,
    backgroundColor: "#f0f8ff",
    borderColor: "#00bcd4",
    borderWidth: 1,
  },
  presetsTitle: {
    color: "#00bcd4",
    fontSize: 16,
    marginBottom: 8,
  },
  presetsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  presetButton: {
    backgroundColor: "#e0f7fa",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: "#00bcd4",
  },
  presetText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 15,
  },
  presetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#00bcd4",
    borderRadius: 8,
    padding: 8,
    backgroundColor: "#fff",
    fontSize: 16,
    marginRight: 8,
  },
  presetAddButton: {
    backgroundColor: "#00bcd4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  presetAddText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  amountSection: {
    marginTop: 24,
    marginBottom: 8,
    backgroundColor: "#e6f7ff",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  qrSection: {
    backgroundColor: "#fffbe6",
    borderColor: "#FFD700",
    borderWidth: 1,
    alignItems: "center",
  },

  qrHint: {
    color: "#888",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  createdSection: {
    marginTop: 8,
  },

  amountDate: {
    fontSize: 12,
    color: "#888",
  },
});

export default CobrarScreen;
