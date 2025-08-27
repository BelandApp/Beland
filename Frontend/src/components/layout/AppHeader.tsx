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
  const { user, isLoading, loginWithAuth0, logout, setUser } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCommerceAlert, setShowCommerceAlert] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);

  // No necesitamos un estado local de carga, ya usamos el del AuthContext.
  // const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      // Actualizar el usuario en el contexto para reflejar el cambio de rol
      if (user) {
        setUser({ ...user, role: "COMMERCE", role_name: "Comerciante" });
      }
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
                        user.role_name === "Comercio" ? "#4CAF50" : "#2196F3",
                    },
                  ]}
                >
                  <Text style={[styles.roleBadgeText, { color: "#fff" }]}>
                    {user.role_name}
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
                {user?.role_name !== "COMMERCE" && (
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
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
    gap: 12,
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
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
  },
  roleBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  modalOverlay: {
    flex: 1,
  },
  menuDropdown: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    width: 180,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
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
