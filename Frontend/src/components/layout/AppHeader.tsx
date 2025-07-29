import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BeCoinIcon } from "../icons/BeCoinIcon";
import { BelandLogo } from "../icons/BelandLogo";
import { BeCoinsBalance } from "../ui/BeCoinsBalance";
import { colors } from "../../styles/colors";

interface AppHeaderProps {
  userName?: string;
  coinsAmount?: number;
  onMenuPress?: () => void;
  onCoinsPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userName = "Zaire",
  coinsAmount, // Ya no se usa, se obtiene del store
  onMenuPress,
  onCoinsPress,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.userSection}>
        <View style={styles.logoContainer}>
          <BelandLogo width={24} height={36} color="#FFFFFF" />
        </View>
        <Text style={styles.greeting}>¡Hola, {userName}!</Text>
      </View>
      <BeCoinsBalance
        size="medium"
        variant="header"
        onPress={onCoinsPress}
        style={styles.coinsSection}
      />
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
    justifyContent: "space-between",
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
    gap: 12,
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  coinsSection: {
    // El BeCoinsBalance se encarga de todos los estilos
  },
  headerCoinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  coinsText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  coinsLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    opacity: 0.8,
  },
  menuButton: {
    padding: 8,
    marginLeft: 12,
  },
  menuIcon: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
