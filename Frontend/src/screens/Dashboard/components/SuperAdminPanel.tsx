import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "src/hooks/AuthContext";
import DashboardWrapper from "./DashboardWrapper";

// Datos simulados para el rol de SUPERADMIN
interface SuperAdminStats {
  totalEnterprises: number;
  totalProjects: number;
  systemHealth: string;
}

const SuperAdminPanel: React.FC = () => {
  const { user, isLoading } = useAuth();

  const superAdminStats: SuperAdminStats = {
    totalEnterprises: 50,
    totalProjects: 500,
    systemHealth: "Óptimo",
  };

  return (
    <DashboardWrapper
      title={`Panel de ${user?.full_name || "Super Administrador"}`}
      isLoading={isLoading}>
      {user ? (
        <View style={styles.container}>
          <View style={styles.profileCard}>
            <Image
              source={{
                uri:
                  user.profile_picture_url ||
                  "https://ui-avatars.com/api/?name=Super+Admin&background=random",
              }}
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>
              {user.full_name || user.email.split("@")[0]}
            </Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {superAdminStats.totalEnterprises}
              </Text>
              <Text style={styles.statLabel}>Empresas Totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {superAdminStats.totalProjects}
              </Text>
              <Text style={styles.statLabel}>Proyectos en Curso</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {superAdminStats.systemHealth}
              </Text>
              <Text style={styles.statLabel}>Estado del Sistema</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No se pudieron cargar los datos del usuario.
          </Text>
        </View>
      )}
    </DashboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  statCard: {
    width: "30%",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 5,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
  },
});

export default SuperAdminPanel;
