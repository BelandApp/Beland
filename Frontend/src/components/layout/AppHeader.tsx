import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { BeCoinsBalance } from "../ui/BeCoinsBalance";
import { colors } from "../../styles/colors";
import { useAuth } from "src/hooks/AuthContext";

interface AppHeaderProps {
  userName?: string;
  onMenuPress?: () => void;
  onCoinsPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName = "Usuario",
  onMenuPress,
  onCoinsPress,
}) => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || userName;

  const handleMenuPress = () => {
    setShowMenu(!showMenu);
  };

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  return (
    <>
      <View style={styles.header}>
        {/* Fila única: Usuario, balance y menú */}
        <View style={styles.mainRow}>
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              {user?.picture ? (
                <View style={styles.avatarPlaceholder}>
                  <Image
                    source={{ uri: user.picture }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 21,
                    }}
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {getInitials(displayName)}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.welcomeText}>¡Bienvenido!</Text>
              <Text style={styles.userName}>{displayName}</Text>
            </View>
          </View>

          <View style={styles.rightSection}>
            <BeCoinsBalance
              size="small"
              variant="header"
              onPress={onCoinsPress}
              style={styles.coinsBalance}
            />

            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleMenuPress}
            >
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
              <View style={styles.menuDot} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Menú desplegable fuera del header */}
      {showMenu && (
        <View style={styles.menuDropdown}>
          {user && (
            <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
              <Text style={styles.menuItemIcon}>⎋</Text>
              <Text style={styles.menuItemText}>Salir</Text>
            </TouchableOpacity>
          )}
          {onMenuPress && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onMenuPress();
              }}
            >
              <Text style={styles.menuItemIcon}>⚙</Text>
              <Text style={styles.menuItemText}>Configuración</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Overlay invisible para cerrar el menú al tocar fuera */}
      {showMenu && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowMenu(false)}
          activeOpacity={1}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.belandOrange,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 16, // Reducido para Android porque la barra de estado está oculta
    paddingBottom: 16, // Optimizado para una sola fila
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Removemos position: "relative" para que no limite el menú
  },
  // Fila principal única
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    overflow: "hidden",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 1,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 1.5,
  },
  menuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
  },
  coinsBalance: {
    // El balance se alineará automáticamente
  },
  // Estilos del menú desplegable
  menuDropdown: {
    position: "absolute",
    top: 60, // Ajustado para estar más abajo del header
    right: 20, // Alineado con el botón de menú
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    minWidth: 150,
    paddingVertical: 8,
    elevation: 30, // Máximo elevation para Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    zIndex: 999999, // Z-index extremadamente alto
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)", // Borde sutil para definir mejor el menú
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  menuItemIcon: {
    fontSize: 16,
    color: "#666666",
    width: 20,
    textAlign: "center",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
  // Overlay para cerrar el menú
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999998, // Justo debajo del menú
    backgroundColor: "transparent",
  },
});
