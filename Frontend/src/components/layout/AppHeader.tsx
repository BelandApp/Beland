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
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "src/hooks/AuthContext";
import { LogOut, LayoutDashboard } from "lucide-react-native";
import { RootStackParamList } from "./RootStackNavigator";
import { StackNavigationProp } from "@react-navigation/stack";

type AppHeaderNavigationProp = StackNavigationProp<RootStackParamList>;

export const AppHeader = () => {
  const navigation = useNavigation<AppHeaderNavigationProp>();
  const { user, isLoading, isDemo, loginWithAuth0, logout, loginAsDemo } =
    useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogin = async () => {
    await loginWithAuth0();
  };

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  const handleDemoLogin = () => {
    loginAsDemo();
  };

  const handleNavigateToDashboard = () => {
    setMenuVisible(false);
    navigation.navigate("UserDashboardScreen");
  };

  // Nuevo: Mostrar un spinner de carga si la sesión está en proceso de restauración.
  if (isLoading) {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Beland</Text>
        <ActivityIndicator size="small" color="#1E90FF" />
      </View>
    );
  }

  const isLoggedIn = !!user;
  const userName = user?.name ?? "Usuario";
  const userPicture = user?.picture;

  // NUEVO: Función para obtener el estilo del badge según el rol
  const getRoleBadgeStyle = () => {
    switch (user?.role) {
      case "SUPERADMIN":
        return { backgroundColor: "#FFD700", color: "#333" }; // Dorado
      case "ADMIN":
        return { backgroundColor: "#00BFFF", color: "#fff" }; // Azul cielo
      case "LEADER":
        return { backgroundColor: "#32CD32", color: "#fff" }; // Verde
      case "EMPRESA":
        return { backgroundColor: "#FF6347", color: "#fff" }; // Rojo tomate
      case "USER":
      default:
        return { backgroundColor: "#D3D3D3", color: "#555" }; // Gris
    }
  };

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Beland</Text>

      {!isLoggedIn ? (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: "#aaa" }]}
            onPress={handleDemoLogin}>
            <Text style={styles.loginButtonText}>Modo demo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loginContainer}>
          {userPicture && (
            <Image source={{ uri: userPicture }} style={styles.avatar} />
          )}

          {/* NUEVO: Contenedor para el nombre y el badge de rol */}
          <View style={{ alignItems: "flex-end" }}>
            <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
              <Text style={styles.userName}>
                {user?.full_name || user?.email.split("@")[0]}
              </Text>
            </TouchableOpacity>
            {/* NUEVO: Badge de rol con estilo dinámico */}
            {user?.role && (
              <View style={[styles.roleBadge, getRoleBadgeStyle()]}>
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: getRoleBadgeStyle().color },
                  ]}>
                  {user.role_name || user.role}
                </Text>
              </View>
            )}
          </View>

          <Modal transparent={true} visible={menuVisible} animationType="fade">
            <Pressable
              style={styles.overlay}
              onPress={() => setMenuVisible(false)}
            />
            <View style={styles.menuDropdown}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleNavigateToDashboard}>
                <LayoutDashboard size={18} style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <LogOut size={18} style={styles.menuItemIcon} />
                <Text style={styles.menuItemText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E90FF",
  },
  loginButton: {
    backgroundColor: "#1E90FF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loginContainer: {
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
  // NUEVO: Estilos para el badge de rol
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
  menuIcon: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000",
    marginVertical: 1,
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
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  menuItemIcon: {
    marginRight: 10,
    color: "#333",
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
export default AppHeader;
