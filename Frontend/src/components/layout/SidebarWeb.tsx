import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";

import {
  HomeIcon,
  WalletIcon,
  CatalogIcon,
  GiftIcon,
  GroupIcon,
} from "../icons";

import { useNavigation, useRoute } from "@react-navigation/native";
import { colors } from "../../styles/colors";

import { useAuth } from "src/hooks/AuthContext";

const sidebarItems = [
  { label: "Inicio", route: "Home", icon: HomeIcon },
  { label: "Wallet", route: "Wallet", icon: WalletIcon },
  { label: "Premios", route: "Rewards", icon: GiftIcon },
  { label: "Catálogo", route: "Catalog", icon: CatalogIcon },
  { label: "Grupos", route: "Groups", icon: GroupIcon },
];

export const SidebarWeb = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const userName = user?.name || user?.email || "Usuario";
  // Detectar la ruta activa
  const activeRoute = route?.name;
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>Beland</Text>
      </View>
      <View style={styles.menu}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeRoute === item.route ||
            (item.route === "Home" && activeRoute === "Dashboard");
          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(item.route as never)}
            >
              <Icon
                width={22}
                height={22}
                color={isActive ? colors.belandOrange : colors.textSecondary}
              />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.userSection}>
        <Text style={styles.userName}>{userName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 220,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#E5E7EB",
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    display: Platform.OS === "web" ? "flex" : "none",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingVertical: 32,
    boxShadow: "2px 0 16px rgba(0,0,0,0.04)",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    letterSpacing: 1,
  },
  menu: {
    flex: 1,
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 2,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: colors.belandGreenLight,
  },
  // menuIcon eliminado, ahora se usan componentes de íconos
  menuText: {
    fontSize: 17,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  userSection: {
    alignItems: "center",
    marginTop: 32,
  },
  userName: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
