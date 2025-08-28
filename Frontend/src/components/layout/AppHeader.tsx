import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import BelandLogo2 from "../icons/BelandLogo2";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "src/hooks/AuthContext";
import { LogOut, LayoutDashboard, Store } from "lucide-react-native";
import { RootStackParamList } from "./RootStackNavigator";
import { StackNavigationProp } from "@react-navigation/stack";
import { showSuccessAlert, showErrorAlert } from "src/utils/alertHelpers";
import { authService } from "src/services/authService";

type AppHeaderNavigationProp = StackNavigationProp<RootStackParamList>;

export const AppHeader = () => {
  const navigation = useNavigation<AppHeaderNavigationProp>();
  const { user, isLoading, loginWithAuth0, logout, setUser, fetchWithAuth } =
    useAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [showCommerceAlert, setShowCommerceAlert] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const getProfile = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/me`
      );
      if (!response.ok) return;
      const data = await response.json();
      setUser({ ...data, picture: data.profile_picture_url });
    } catch {}
  };

  const handleLogin = async () => {
    // La función loginWithAuth0() del hook ya actualiza isLoading
    await loginWithAuth0();
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  // Navega siempre al dashboard del usuario
  const handleNavigateToDashboard = () => {
    setMenuVisible(false);
    navigation.navigate("UserDashboardScreen");
  };

  const handleChangeRoleToCommerce = async () => {
    setIsChangingRole(true);
    try {
      const resp = await authService.changeRoleToCommerce();
      setShowCommerceAlert(false);
      showSuccessAlert(
        "¡Ya eres comerciante!",
        "Tu perfil ha sido actualizado y ahora puedes recibir pagos por QR.",
        "OK"
      );
      await getProfile(); // Refresca el usuario desde el backend
    } catch (err) {
      setShowCommerceAlert(false);
      showErrorAlert(
        "Error",
        String(err) || "No se pudo cambiar el rol. Intenta nuevamente.",
        "OK"
      );
    } finally {
      setIsChangingRole(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.headerContainer}>
        <BelandLogo2 width={120} height={32} />
        <ActivityIndicator size="small" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => navigation.navigate("Home")}
      >
        <BelandLogo2 width={120} height={32} />
      </TouchableOpacity>

      {/* Usamos el mismo isLoading para todo el proceso */}
      {isLoading ? (
        <ActivityIndicator size="small" color="#2196F3" />
      ) : user ? (
        <View style={styles.loginContainer}>
          <TouchableOpacity onPress={toggleMenu} style={styles.avatarContainer}>
            <Image
              source={{
                uri: user.picture || "https://ui-avatars.com/api/?name=User",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.userName}>
                {user.full_name?.split(" ")[0]}
              </Text>
              {user.role_name && (
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        user.role_name === "COMMERCE" ||
                        user.role_name === "Comercio"
                          ? "#4CAF50"
                          : "#2196F3",
                    },
                  ]}
                >
                  <Text style={[styles.roleBadgeText, { color: "#fff" }]}>
                    {user.role_name === "COMMERCE" ||
                    user.role_name === "Comercio"
                      ? "Comerciante"
                      : user.role_name}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={menuVisible}
            onRequestClose={toggleMenu}
          >
            <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleNavigateToDashboard}
                >
                  <LayoutDashboard size={20} color="#333" />
                  <Text style={styles.menuItemText}>Dashboard</Text>
                </TouchableOpacity>

                {/* Mostrar opción solo si el usuario NO es comerciante */}
                {!(
                  user?.role_name === "COMMERCE" ||
                  user?.role_name === "Comercio"
                ) && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => setShowCommerceAlert(true)}
                  >
                    <Store size={18} style={styles.menuItemIcon} />
                    <Text style={styles.menuItemText}>Hacerme comerciante</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}
                >
                  <LogOut size={20} color="#E53935" />
                  <Text style={styles.menuItemText}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <TouchableOpacity onPress={handleLogin}>
            <Text style={styles.loginButton}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal para confirmar cambio de rol a comerciante */}
      {showCommerceAlert && (
        <Modal
          transparent={true}
          visible={showCommerceAlert}
          animationType="fade"
        >
          <Pressable
            style={styles.overlay}
            onPress={() => setShowCommerceAlert(false)}
          />
          <View style={[styles.menuDropdown, { top: 120 }]}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              ¿Quieres convertirte en comerciante?
            </Text>
            <Text style={{ marginBottom: 16 }}>
              Esto actualizará tu perfil y habilitará la recepción de pagos por
              QR.
            </Text>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: "#1E90FF" }]}
              onPress={handleChangeRoleToCommerce}
              disabled={isChangingRole}
            >
              <Text style={[styles.menuItemText, { color: "#fff" }]}>
                Confirmar
              </Text>
              {isChangingRole && (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.menuItem, { marginTop: 8 }]}
              onPress={() => setShowCommerceAlert(false)}
            >
              <Text style={styles.menuItemText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 80,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },

  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal:
      typeof window !== "undefined" && window.innerWidth < 600 ? 12 : 32,
    paddingTop:
      typeof window !== "undefined" && window.innerWidth < 600 ? 28 : 40,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 2,
    borderBottomColor: "#f88d2a",
    shadowColor: "#f88d2a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      typeof window !== "undefined" && window.innerWidth < 600
        ? "center"
        : "flex-start",
    flex: 1,
  },
  logo: {
    width: typeof window !== "undefined" && window.innerWidth < 600 ? 100 : 120,
    height: typeof window !== "undefined" && window.innerWidth < 600 ? 28 : 32,
    resizeMode: "contain",
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    boxShadow: "0 2px 8px rgba(248, 141, 42, 0.08)",
  },
  loginButton: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  demoButton: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 2,
    shadowColor: "#f88d2a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#f88d2a",
    shadowColor: "#f88d2a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  roleBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
    backgroundColor: "#f88d2a",
    shadowColor: "#f88d2a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
  },
  menuDropdown: {
    position: "absolute",
    top: 120,
    right: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    width: 200,
    elevation: 8,
    shadowColor: "#f88d2a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: "#f88d2a",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  menuItemIcon: {
    marginRight: 10,
    color: "#333",
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
});
