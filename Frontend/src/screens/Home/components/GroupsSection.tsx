import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useGroups } from "../../../hooks/useGroups";
import { Card } from "src/components/ui/Card";
import { GroupIcon } from "../../../components/icons";

const { width: screenWidth } = Dimensions.get("window");

export const GroupsSection = () => {
  const navigation = useNavigation();
  const { activeGroups, isLoading, error } = useGroups();

  const handleNavigateToGroups = () => {
    navigation.navigate("Groups" as never);
  };

  if (isLoading) {
    return (
      <View style={groupStyles.container}>
        <Text style={groupStyles.title}>Cargando grupos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={groupStyles.container}>
        <Text style={[groupStyles.title, { color: "red" }]}>
          Error al cargar los grupos: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={groupStyles.container}>
      <Text style={groupStyles.title}>Grupos</Text>
      <Text style={groupStyles.subtitle}>
        Gestiona compras conjuntas y divide los costos con tus amigos.
      </Text>

      {activeGroups.length > 0 ? (
        <>
          <Text style={groupStyles.sectionTitle}>Tus grupos activos</Text>
          {activeGroups.slice(0, 2).map(group => (
            <Card key={group.id} style={groupStyles.groupCard}>
              <View style={groupStyles.groupHeader}>
                <GroupIcon width={20} height={20} color="#386641" />
                <Text style={groupStyles.groupName}>{group.name}</Text>
              </View>
              <Text style={groupStyles.groupStatus}>
                Estado: {group.status}
              </Text>
            </Card>
          ))}
          <TouchableOpacity
            style={groupStyles.button}
            onPress={handleNavigateToGroups}>
            <Text style={groupStyles.buttonText}>Ver todos mis grupos</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={groupStyles.emptyStateContainer}>
          <Text style={groupStyles.emptyStateText}>
            Aún no tienes grupos. ¡Crea el primero y empieza a ahorrar!
          </Text>
          <TouchableOpacity
            style={groupStyles.button}
            onPress={handleNavigateToGroups}>
            <Text style={groupStyles.buttonText}>Crear mi primer grupo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const groupStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333", // ✅ Usando color de tu HomeView
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#555", // ✅ Usando color de tu HomeView
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333", // ✅ Usando color de tu HomeView
    marginBottom: 12,
  },
  groupCard: {
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  groupStatus: {
    fontSize: 14,
    color: "#888", // ✅ Usando color de tu HomeView
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0", // ✅ Usando color de tu HomeView
    borderRadius: 8,
  },
  emptyStateText: {
    textAlign: "center",
    marginBottom: 16,
    color: "#555", // ✅ Usando color de tu HomeView
  },
  button: {
    backgroundColor: "#386641", // ✅ Usando color de tu HomeView
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
