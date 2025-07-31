import React from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";

const DATA = [
  {
    id: "1",
    icon: "https://cdn-icons-png.flaticon.com/512/2913/2913461.png",
    title: "5",
    subtitle: "Hace 2 horas\nShoping Abasto",
    amount: "+50 BCO",
    type: "in",
  },
  {
    id: "2",
    icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
    title: "Combo comida light",
    subtitle: "Hace 2 días\nMango Soul Club",
    amount: "-100 BCO",
    type: "out",
  },
  {
    id: "3",
    icon: "https://cdn-icons-png.flaticon.com/512/2913/2913461.png",
    title: "4",
    subtitle: "02 de Marzo\nShoping Abasto",
    amount: "+40 BCO",
    type: "in",
  },
  {
    id: "4",
    icon: "https://cdn-icons-png.flaticon.com/512/1256/1256650.png",
    title: "Enviado a María Confetti",
    subtitle: "02 de Marzo",
    amount: "-40 BCO",
    type: "out",
  },
  {
    id: "5",
    icon: "https://cdn-icons-png.flaticon.com/512/2913/2913461.png",
    title: "1",
    subtitle: "26 de Marzo\nShoping Abasto",
    amount: "+10 BCO",
    type: "in",
  },
  {
    id: "6",
    icon: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
    title: "Combo vegano",
    subtitle: "Hace 2 días",
    amount: "-100 BCO",
    type: "out",
  },
];

const HistoryScreen = () => {
  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Image source={{ uri: item.icon }} style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      <Text
        style={[
          styles.amount,
          item.type === "out" ? styles.amountOut : styles.amountIn,
        ]}
      >
        {item.amount}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eaf1f8", padding: 16 },
  headerCard: {
    flexDirection: "row",
    backgroundColor: "#4ecdc4",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 24,
  },
  headerLeft: { flex: 1 },
  availableLabel: { color: "#fff", fontSize: 16 },
  availableValue: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  estimated: { color: "#fff", fontSize: 14 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginLeft: 12 },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  icon: { width: 36, height: 36, marginRight: 12 },
  title: { fontSize: 16, fontWeight: "bold", color: "#222" },
  subtitle: { fontSize: 13, color: "#888" },
  amount: { fontSize: 16, fontWeight: "bold", marginLeft: 12 },
  amountIn: { color: "#4ecdc4" },
  amountOut: { color: "#f55b5b" },
});

export default HistoryScreen;
