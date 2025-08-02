import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { BeCoinsBalance } from "../ui/BeCoinsBalance";
import { colors } from "../../styles/colors";
import { BelandLogo } from "../icons/BelandLogo";
import { useAuth } from "src/hooks/AuthContext";
import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import { Platform } from "react-native";


interface AppHeaderProps {
  userName?: string;
  onMenuPress?: () => void;
  onCoinsPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName = "Zaire",
  onMenuPress,
  onCoinsPress,
}) => {
  const { user, login, logout } = useAuth();
  const isWeb = Platform.OS === "web";

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "belandnative",
    native: "belandnative://callback",
    ...(Platform.OS !== "web" ? { useProxy: true } : {}),
  });

  return (
    <View style={styles.header}>
      <View style={styles.userSection}>
        <View style={styles.logoContainer}>
          <BelandLogo width={24} height={36} color="#FFFFFF" />
        </View>
        <Text style={styles.greeting}>¡Hola, {user?.name ?? userName}!</Text>
        {/*<Text style={{ fontSize: 12, color: "white" }}>{redirectUri}</Text>*/}
      </View>

      <BeCoinsBalance
        size="medium"
        variant="header"
        onPress={onCoinsPress}
        style={styles.coinsSection}
      />

      {user ? (
        <View style={styles.userActions}>
          {user.picture && (
            <Image
              source={{ uri: user.picture }}
              style={styles.avatar}
              resizeMode="cover"
            />
          )}
          <TouchableOpacity onPress={logout}>
            <Text style={styles.authButton}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={login}>
          <Text style={styles.authButton}>Iniciar sesión</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>⋮</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  coinsSection: {},
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  menuIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  authButton: {
    color: "#FFFFFF",
    padding: 8,
    marginLeft: 8,
  },
  authButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  userActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
});
