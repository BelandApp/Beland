import React, { useRef, useState, useEffect } from "react";
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
  {
    label: "Inicio",
    route: "Home",
    icon: HomeIcon,
  },
  { label: "Wallet", route: "Wallet", icon: WalletIcon },
  { label: "Premios", route: "Rewards", icon: GiftIcon },
  { label: "Catálogo", route: "Catalog", icon: CatalogIcon },
  { label: "Grupos", route: "Groups", icon: GroupIcon },
];

export const SidebarWeb = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, logout } = useAuth();
  const userName = user?.name || user?.email || "Usuario";
  // Detectar la ruta activa
  const activeRoute = route?.name;
  const isWeb = typeof window !== "undefined";
  // Menú desplegable
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  if (isWeb) {
    return (
      <div className="sidebar">
        <div className="logoContainer">
          <span className="logo">Beland</span>
        </div>
        <div className="menu">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeRoute === item.route ||
              (item.route === "Home" && activeRoute === "Dashboard");
            return (
              <button
                key={item.route}
                className={`menuItem${isActive ? " menuItemActive" : ""}`}
                onClick={() => navigation.navigate(item.route as never)}
              >
                <span className="menuIcon">
                  <Icon
                    width={22}
                    height={22}
                    color={
                      isActive ? colors.belandOrange : colors.textSecondary
                    }
                  />
                </span>
                <span className="menuText">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="userSection">
          <span
            className="userName"
            onClick={() => setShowMenu((v) => !v)}
            title="Opciones de usuario"
            style={{ position: "relative" }}
          >
            {userName}
            {/* Flecha hacia la derecha */}
            <svg
              width="18"
              height="18"
              style={{ marginLeft: 6 }}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="#1976d2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          {showMenu && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: 180,
                minWidth: 160,
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: 12,
                boxShadow: "0 4px 16px #bdbdbd33",
                zIndex: 100,
                padding: "8px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "#d32f2f",
                  fontWeight: 600,
                  fontSize: 15,
                  padding: "10px 24px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                  borderRadius: 8,
                  transition: "background 0.2s",
                }}
                onClick={() => {
                  logout();
                  setShowMenu(false);
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#fbe9e7")
                }
                onMouseOut={(e) => (e.currentTarget.style.background = "none")}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Solo estilos de React Native para mobile
  return (
    <View
      style={{
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
        flexDirection: "column",
        justifyContent: "space-between",
        paddingVertical: 32,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 32 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.primary,
            letterSpacing: 1,
          }}
        >
          Beland
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeRoute === item.route ||
            (item.route === "Home" && activeRoute === "Dashboard");
          return (
            <TouchableOpacity
              key={item.route}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 8,
                marginVertical: 2,
                backgroundColor: isActive
                  ? colors.belandGreenLight
                  : "transparent",
                gap: 12,
              }}
              onPress={() => navigation.navigate(item.route as never)}
            >
              <Icon
                width={22}
                height={22}
                color={isActive ? colors.belandOrange : colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "500",
                  color: colors.textPrimary,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ alignItems: "center", marginTop: 32 }}>
        <Text style={{ fontSize: 15, color: colors.textSecondary }}>
          {userName}
        </Text>
      </View>
    </View>
  );
};

// ...existing code...
