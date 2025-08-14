import React from "react";
import { useAuth } from "src/hooks/AuthContext";
import SuperAdminPanel from "./components/SuperAdminPanel";
import AdminPanel from "./components/AdminPanel";
import LeaderPanel from "./components/LeaderPanel";
import EmpresaPanel from "./components/EmpresaPanel";
import UserPanel from "./components/UserPanel";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

const UserDashboard: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Paso 1: Muestra un loader si la información del usuario se está cargando
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Paso 2: Maneja el caso en el que no hay un usuario logueado
  if (!user || !user.role) {
    // Si no hay usuario o rol, no se debe renderizar este dashboard
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No tienes permisos para ver esta página.
        </Text>
      </View>
    );
  }

  // Paso 3: Renderiza el componente adecuado basado en el rol del usuario
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    textAlign: "center",
  },
});

export default UserDashboard;
