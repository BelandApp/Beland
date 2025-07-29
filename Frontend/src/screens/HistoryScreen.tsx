import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BottleRecycleIcon,
  BeCoinIcon,
  WaveBottom,
  HistoryIcon,
} from "../components/icons";
import { colors } from "../styles/colors";

const historyData = [
  {
    id: 1,
    date: "Hace 2 horas",
    location: "Shopping Abasto",
    coins: 50,
  },
  {
    id: 2,
    date: "25 de Febrero",
    location: "Shopping Abasto",
    coins: 10,
  },
  {
    id: 3,
    date: "12 de Febrero",
    location: "Shopping Abasto",
    coins: 50,
  },
  {
    id: 4,
    date: "1 de Febrero",
    location: "Shopping Abasto",
    coins: 120,
  },
  {
    id: 5,
    date: "15 de Enero",
    location: "Shopping Abasto",
    coins: 30,
  },
  {
    id: 6,
    date: "15 de Enero",
    location: "Shopping Abasto",
    coins: 30,
  },
  {
    id: 7,
    date: "15 de Enero",
    location: "Shopping Abasto",
    coins: 30,
  },
  {
    id: 8,
    date: "15 de Enero",
    location: "Shopping Abasto",
    coins: 30,
  },
  {
    id: 9,
    date: "15 de Enero",
    location: "Shopping Abasto",
    coins: 30,
  },
];

export const HistoryScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <View style={styles.iconCircle} />
        </View>
        <Text style={styles.headerTitle}>HISTORIAL</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {/* Wave decoration at bottom */}
        <View style={styles.waveContainer}>
          <WaveBottom width={375} height={100} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {historyData.map((item) => (
            <TouchableOpacity key={item.id} style={styles.historyItem}>
              <View style={styles.historyContent}>
                <View style={styles.leftSection}>
                  <View style={styles.iconContainer}>
                    <BottleRecycleIcon width={32} height={32} />
                  </View>
                  <View style={styles.textSection}>
                    <Text style={styles.dateText}>{item.date}</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>
                </View>
                <View style={styles.rightSection}>
                  <View style={styles.coinsContainer}>
                    <BeCoinIcon width={18} height={18} />
                    <Text style={styles.coinsText}>{item.coins} BCO</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: colors.belandOrange,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 50, // Para compensar la barra de estado
    gap: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingTop: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    zIndex: 1,
  },
  historyItem: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textSection: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: "#666666",
  },
  rightSection: {
    alignItems: "flex-end",
  },
  coinsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAB400",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  waveContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: "hidden",
    zIndex: 0,
  },
  scrollContent: {
    paddingBottom: 0, // Sin padding inferior para eliminar el espacio gris
  },
});
