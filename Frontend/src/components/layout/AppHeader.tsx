import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useAuth } from "src/hooks/AuthContext";
import { LogOut } from "lucide-react-native";

export const AppHeader = () => {
  const { user, isDemo, loginWithAuth0, logout, loginAsDemo } = useAuth();
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

  const isLoggedIn = !!user;
  const userName = user?.name ?? "Usuario";
  const userPicture = user?.picture;

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
          <Text style={styles.userName}>{userName}</Text>

          <TouchableOpacity onPress={() => setMenuVisible(true)}>
            <View style={styles.menuIcon}>
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
            </View>
          </TouchableOpacity>

          <Modal transparent={true} visible={menuVisible} animationType="fade">
            <Pressable
              style={styles.overlay}
              onPress={() => setMenuVisible(false)}
            />
            <View style={styles.menuDropdown}>
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
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
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
    right: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    elevation: 5,
    zIndex: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuItemIcon: {
    marginRight: 8,
  },
  menuItemText: {
    fontSize: 16,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
