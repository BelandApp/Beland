import React from "react";
import { useAuth } from "src/hooks/AuthContext";
import SuperAdminPanel from "./components/SuperAdminPanel";
import AdminPanel from "./components/AdminPanel";
import LeaderPanel from "./components/LeaderPanel";
import EmpresaPanel from "./components/EmpresaPanel";
import UserPanel from "./components/UserPanel";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const UserDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando datos del usuario...</Text>
      </View>
    );
  }

  if (!user || !user.role) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No se pudo cargar la información del usuario. Intente iniciar sesión
          nuevamente.
        </Text>
      </View>
    );
  }

  switch (user.role) {
    case "SUPERADMIN":
      return <SuperAdminPanel />;
    case "ADMIN":
      return <AdminPanel />;
    case "LEADER":
      return <LeaderPanel />;
    case "EMPRESA":
      return <EmpresaPanel />;
    case "USER":
      return <UserPanel />;
    default:
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>
            No se reconoce tu rol. Contacta al soporte.
          </Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    textAlign: "center",
  },
});

export default UserDashboard;
