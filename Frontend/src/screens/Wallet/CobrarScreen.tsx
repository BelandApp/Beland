import React, { useState, useEffect } from "react";
import { Platform } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { walletService } from "../../services/walletService";
import { convertUSDToBeCoins } from "../../constants/currency";
import { useNavigation } from "@react-navigation/native";

const CobrarScreen = () => {
  const [showPresetForm, setShowPresetForm] = useState(false);
  const navigation = useNavigation();
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [amount, setAmount] = useState(""); // USD
  const [amounts, setAmounts] = useState<any[]>([]);
  const [loadingAmounts, setLoadingAmounts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [presets, setPresets] = useState<any[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [presetAmount, setPresetAmount] = useState(""); // USD
  const [presetName, setPresetName] = useState("");
  const [presetMessage, setPresetMessage] = useState("");
  const IS_WEB = Platform.OS && String(Platform.OS).toLowerCase() === "web";

  // Helper para formatear monto USD
  const formatUSD = (value: string | number) => {
    if (!value) return "$0.00";
    return `$${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
        <span style={{ display: "flex", alignItems: "center" }}>
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
        // Obtener el token desde el store o localStorage
        let token;
        try {
          token =
            require("../../stores/useAuthTokenStore").useAuthTokenStore.getState()
              .token;
        } catch (e) {
          token = null;
        }
        if (!token && typeof window !== "undefined") {
          token = localStorage.getItem("auth_token");
        }
        if (!token) {
          setQrError(
            "No hay token de autenticación. El usuario debe iniciar sesión."
          );
          setQrLoading(false);
          return;
        }
        // Llamar al servicio pasando el token
        const resp =
          await require("../../services/walletService").walletService.getWalletQRWithToken(
            token
          );
        setQrImage(resp);
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
      setAmounts(Array.isArray(res) ? res[0] : res || []);
    } catch (err) {
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
      // No alert, solo log
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
      presetAmount === "" ||
      isNaN(Number(presetAmount)) ||
      Number(presetAmount) < 0
    ) {
      Alert.alert(
        "Error",
        "Ingresa un monto válido para el preset (mayor o igual a 0)"
      );
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
    if (amount === "" || isNaN(Number(amount)) || Number(amount) < 0) {
      Alert.alert("Error", "Ingresa un monto válido (mayor o igual a 0)");
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
    try {
      await walletService.deleteAmountToPayment(id);
      fetchAmounts();
    } catch (err) {
      Alert.alert("Error", "No se pudo eliminar el monto");
    }
  };

  const handleDeletePreset = async (id: string) => {
    try {
      await walletService.deletePresetAmount(id);
      fetchPresets();
    } catch (err) {
      Alert.alert("Error", "No se pudo eliminar el preset");
    }
  };

  if (IS_WEB) {
    return (
      <div style={{ height: "100vh", overflowY: "auto", width: "100%" }}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 8,
                marginBottom: 8,
                marginLeft: 4,
                shadowColor: "#007AFF",
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
                alignSelf: "flex-start",
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#E0E7EF",
              }}
            >
              <Icon name="arrow-back" size={24} color="#007AFF" />
              <Text
                style={{
                  color: "#007AFF",
                  fontWeight: "bold",
                  fontSize: 16,
                  marginLeft: 4,
                }}
              >
                Atrás
              </Text>
            </TouchableOpacity>
            <Text style={styles.title}>Cobrar en USD</Text>
            {/* Mostrar presets arriba del formulario de monto a cobrar */}
            {presets.length > 0 && (
              <View style={{ marginTop: 16, marginBottom: 8 }}>
                <Text
                  style={{
                    color: "#007AFF",
                    fontSize: 16,
                    fontWeight: "bold",
                    marginBottom: 6,
                  }}
                >
                  Presets disponibles
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {presets.map((preset, idx) => (
                    <View
                      key={preset.id}
                      style={{
                        position: "relative",
                        margin: 4,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#e0f7fa",
                          borderRadius: 20,
                          paddingVertical: 10,
                          paddingHorizontal: 22,
                          margin: 4,
                          borderWidth: 2,
                          borderColor: "#007AFF",
                          shadowColor: "#007AFF",
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
                          {preset.name ? preset.name + " - " : ""}
                          {formatUSD(preset.amount)}
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
                      {/* Botón X para eliminar preset */}
                      <TouchableOpacity
                        style={{
                          position: "absolute",
                          top: 2,
                          right: 2,
                          backgroundColor: "#fff",
                          borderRadius: 12,
                          padding: 2,
                          borderWidth: 1,
                          borderColor: "#E53E3E",
                          zIndex: 2,
                        }}
                        onPress={() => handleDeletePreset(preset.id)}
                      >
                        <Icon name="close" size={16} color="#E53E3E" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Botón para mostrar/ocultar el formulario de presets */}
            <View
              style={{ alignItems: "center", marginBottom: 16, marginTop: 8 }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: showPresetForm ? "#E53E3E" : "#007AFF",
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 16,
                  shadowColor: showPresetForm ? "#E53E3E" : "#007AFF",
                  shadowOpacity: 0.18,
                  shadowRadius: 6,
                  elevation: 3,
                  alignItems: "center",
                  minWidth: 180,
                }}
                onPress={() => setShowPresetForm((prev) => !prev)}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                    letterSpacing: 0.5,
                  }}
                >
                  {showPresetForm
                    ? "Ocultar formulario de preset"
                    : "Agregar preset"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Formulario de presets solo si showPresetForm está activo */}
            {showPresetForm && (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#007AFF",
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
                    borderColor: "#007AFF",
                    borderRadius: 10,
                    padding: 10,
                    backgroundColor: "#fff",
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                  placeholder="Monto en USD"
                  keyboardType="numeric"
                  value={presetAmount}
                  onChangeText={setPresetAmount}
                />
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#007AFF",
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
                    backgroundColor: "#007AFF",
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
            )}
            <View style={[styles.section, styles.amountSection]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: "#007AFF", fontSize: 20 },
                ]}
              >
                1. Ingresa el monto a cobrar (USD)
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 12,
                }}
              >
                <input
                  style={{
                    fontSize: 18,
                    borderColor: "#007AFF",
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 8,
                    width: "100%",
                    boxSizing: "border-box",
                    MozAppearance: "textfield",
                  }}
                  placeholder="Monto en USD"
                  inputMode="decimal"
                  pattern="^\\d*(\\.\\d{0,2})?$"
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    setAmount(val);
                  }}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                />
                <button
                  style={{
                    backgroundColor: "#007AFF",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16,
                    letterSpacing: 0.5,
                    padding: "12px 24px",
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 2px 4px rgba(0,122,255,0.15)",
                    cursor: creating ? "not-allowed" : "pointer",
                    width: "100%",
                  }}
                  onClick={handleCreateAmount}
                  disabled={creating}
                >
                  {creating ? "Guardando..." : "Crear Venta"}
                </button>
              </div>
            </View>

            {/* Conversión a BeCoins */}

            {amount && !isNaN(Number(amount)) && Number(amount) > 0 ? (
              <View
                style={{
                  backgroundColor: "#f4fff7",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 22,
                  marginTop: 18,
                  alignSelf: "center",
                  alignItems: "center",
                  borderWidth: 1.5,
                  borderColor: "#43b86a",
                  maxWidth: 260,
                  shadowColor: "#43b86a",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.13,
                  shadowRadius: 6,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    color: "#2e7d32",
                    fontWeight: "700",
                    letterSpacing: 0.5,
                  }}
                >
                  {convertUSDToBeCoins(Number(amount))} BeCoins
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#43b86a",
                    marginTop: 4,
                    fontWeight: "500",
                  }}
                >
                  Conversión automática según tasa actual
                </Text>
              </View>
            ) : null}
            {/* QR para cobrar */}
            <View style={[styles.section, styles.qrSection]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: "#FFD700", fontSize: 18 },
                ]}
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
              <Text style={styles.sectionTitle}>
                Historial de montos creados (USD)
              </Text>
              {loadingAmounts ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <View>
                  {amounts && amounts.length > 0 ? (
                    amounts.map((item, idx) => (
                      <View style={styles.amountRow} key={item.id || idx}>
                        <View>
                          <Text style={styles.amountText}>
                            {formatUSD(item.amount)}
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
                      style={{
                        textAlign: "center",
                        color: "#888",
                        marginTop: 8,
                      }}
                    >
                      No hay montos creados.
                    </Text>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </div>
    );
  }

  // Un solo return para ambas plataformas
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 8,
            marginBottom: 8,
            marginLeft: 4,
            shadowColor: "#007AFF",
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 2,
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E0E7EF",
          }}
        >
          <Icon name="arrow-back" size={24} color="#007AFF" />
          <Text
            style={{
              color: "#007AFF",
              fontWeight: "bold",
              fontSize: 16,
              marginLeft: 4,
            }}
          >
            Atrás
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cobrar en USD</Text>
        {/* Mostrar presets arriba del formulario de monto a cobrar */}
        {presets.length > 0 && (
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <Text
              style={{
                color: "#007AFF",
                fontSize: 16,
                fontWeight: "bold",
                marginBottom: 6,
              }}
            >
              Presets disponibles
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {presets.map((preset, idx) => (
                <View
                  key={preset.id}
                  style={{
                    position: "relative",
                    margin: 4,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#e0f7fa",
                      borderRadius: 20,
                      paddingVertical: 10,
                      paddingHorizontal: 22,
                      margin: 4,
                      borderWidth: 2,
                      borderColor: "#007AFF",
                      shadowColor: "#007AFF",
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
                      {preset.name ? preset.name + " - " : ""}
                      {formatUSD(preset.amount)}
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
                  {/* Botón X para eliminar preset */}
                  <TouchableOpacity
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "#fff",
                      borderRadius: 12,
                      padding: 2,
                      borderWidth: 1,
                      borderColor: "#E53E3E",
                      zIndex: 2,
                    }}
                    onPress={() => handleDeletePreset(preset.id)}
                  >
                    <Icon name="close" size={16} color="#E53E3E" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Botón para mostrar/ocultar el formulario de presets */}
        <View style={{ alignItems: "center", marginBottom: 16, marginTop: 8 }}>
          <TouchableOpacity
            style={{
              backgroundColor: showPresetForm ? "#E53E3E" : "#007AFF",
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 16,
              shadowColor: showPresetForm ? "#E53E3E" : "#007AFF",
              shadowOpacity: 0.18,
              shadowRadius: 6,
              elevation: 3,
              alignItems: "center",
              minWidth: 180,
            }}
            onPress={() => setShowPresetForm((prev) => !prev)}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 16,
                letterSpacing: 0.5,
              }}
            >
              {showPresetForm
                ? "Ocultar formulario de preset"
                : "Agregar preset"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Formulario de presets solo si showPresetForm está activo */}
        {showPresetForm && (
          <View style={{ marginBottom: 16 }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#007AFF",
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
            <input
              style={{
                fontSize: 16,
                borderColor: "#007AFF",
                backgroundColor: "#fff",
                borderWidth: 1,
                borderStyle: "solid",
                borderRadius: 10,
                padding: 10,
                marginBottom: 8,
                width: "100%",
                boxSizing: "border-box",
                MozAppearance: "textfield",
              }}
              placeholder="Monto en USD"
              inputMode="decimal"
              pattern="^\\d*(\\.\\d{0,2})?$"
              value={presetAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, "");
                setPresetAmount(val);
              }}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
            />
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#007AFF",
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
                backgroundColor: "#007AFF",
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
        )}
        <View style={[styles.section, styles.amountSection]}>
          <Text
            style={[styles.sectionTitle, { color: "#007AFF", fontSize: 20 }]}
          >
            1. Ingresa el monto a cobrar (USD)
          </Text>
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput
              style={[
                styles.input,
                {
                  fontSize: 18,
                  borderColor: "#007AFF",
                  backgroundColor: "#fff",
                },
              ]}
              placeholder="Monto en USD"
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

        {/* Conversión a BeCoins */}

        {amount && !isNaN(Number(amount)) && Number(amount) > 0 ? (
          <View
            style={{
              backgroundColor: "#f4fff7",
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 22,
              marginTop: 18,
              alignSelf: "center",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: "#43b86a",
              maxWidth: 260,
              shadowColor: "#43b86a",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.13,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                color: "#2e7d32",
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              {convertUSDToBeCoins(Number(amount))} BeCoins
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#43b86a",
                marginTop: 4,
                fontWeight: "500",
              }}
            >
              Conversión automática según tasa actual
            </Text>
          </View>
        ) : null}
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
          <Text style={styles.sectionTitle}>
            Historial de montos creados (USD)
          </Text>
          {loadingAmounts ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <View>
              {amounts && amounts.length > 0 ? (
                amounts.map((item, idx) => (
                  <View style={styles.amountRow} key={item.id || idx}>
                    <View>
                      <Text style={styles.amountText}>
                        {formatUSD(item.amount)}
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
      </ScrollView>
    </View>
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginVertical: 12,
    textAlign: "center",
    letterSpacing: 0.5,
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
    borderColor: "#007AFF",
    borderRadius: 10,
    padding: 12,
    marginRight: 8,
    backgroundColor: "#fff",
    fontSize: 18,
    flex: 1,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F6FA",
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: "#007AFF",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  amountText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#007AFF",
    marginBottom: 2,
  },
  deleteButton: {
    padding: 4,
  },
  deleteText: {
    color: "#E53E3E",
    fontSize: 13,
  },
  amountDate: {
    fontSize: 12,
    color: "#888",
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
});

export default CobrarScreen;
