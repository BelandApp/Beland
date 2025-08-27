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
import { showSuccessAlert, showErrorAlert } from "src/utils/alertHelpers";

type AppHeaderNavigationProp = StackNavigationProp<RootStackParamList>;

export const AppHeader = () => {
  const navigation = useNavigation<AppHeaderNavigationProp>();
  const { user, isLoading, isDemo, loginWithAuth0, logout, loginAsDemo } =
    useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCommerceAlert, setShowCommerceAlert] = useState(false);

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

  const handleDemoLogin = () => {
    loginAsDemo();
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleNavigateToDashboard = () => {
    setMenuVisible(false);
    if (user?.role_name === "Comercio") {
      navigation.navigate("CommerceDashboard");
    } else {
      setShowCommerceAlert(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoContainer}
        onPress={() => navigation.navigate("Home")}>
        <Image style={styles.logo} />
        <Text style={styles.appName}>Beland</Text>
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
                  ]}>
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
            onRequestClose={toggleMenu}>
            <Pressable style={styles.modalOverlay} onPress={toggleMenu}>
              <View style={styles.menuDropdown}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleNavigateToDashboard}>
                  <LayoutDashboard size={20} color="#333" />
                  <Text style={styles.menuItemText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleLogout}>
                  <LogOut size={20} color="#E53935" />
                  <Text style={[styles.menuItemText, { color: "#E53935" }]}>
                    Cerrar sesión
                  </Text>
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
          <TouchableOpacity onPress={handleDemoLogin}>
            <Text style={styles.demoButton}>Modo Demo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
