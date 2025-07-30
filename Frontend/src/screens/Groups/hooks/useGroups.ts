import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "../../../types";
import { GroupService } from "../../../services/groupService";
import { groupStorage } from "../../../services/groupStorage";
import { MOCK_GROUPS } from "../../../data/mockData";

export const useGroups = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Suscribirse a cambios en el storage
  useEffect(() => {
    const unsubscribe = groupStorage.subscribe(() => {
      setRefreshKey((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  // Refrescar cuando se enfoca la pantalla
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const getAllGroups = (): Group[] => {
    const storageGroups = GroupService.getAllGroups();
    const storageIds = new Set(storageGroups.map((group) => group.id));

    // Solo incluir grupos mockeados que no estén ya en el storage
    const uniqueMockGroups = MOCK_GROUPS.filter(
      (group) => !storageIds.has(group.id)
    );

    return [...uniqueMockGroups, ...storageGroups];
  };

  const getActiveGroups = (): Group[] => {
    const allGroups = getAllGroups();
    return allGroups.filter(
      (group) => group.status === "active" || group.status === "pending_payment"
    );
  };

  const getCompletedGroups = (): Group[] => {
    const allGroups = getAllGroups();
    return allGroups.filter((group) => group.status === "completed");
  };

  const getGroupById = (id: string): Group | undefined => {
    const allGroups = getAllGroups();
    return allGroups.find((group) => group.id === id);
  };

  return {
    getAllGroups,
    getActiveGroups,
    getCompletedGroups,
    getGroupById,
    refreshKey, // Para forzar re-render cuando sea necesario
  };
};
