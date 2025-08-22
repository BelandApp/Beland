import { useState, useEffect, useCallback } from "react";
import { GroupService } from "../services/groupService";
import { Group as ApiGroup } from "../types/Group";

interface UseGroupsResult {
  activeGroups: ApiGroup[];
  completedGroups: ApiGroup[];
  totalActiveGroups: number;
  totalCompletedGroups: number;
  isLoading: boolean;
  error: string | null;
  refreshGroups: () => Promise<void>;
}

export const useGroups = (): UseGroupsResult => {
  const [allGroups, setAllGroups] = useState<ApiGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiResponse = await GroupService.getGroupsFromApi();
      setAllGroups(apiResponse.groups);
    } catch (err: any) {
      setError(err.message || "Error al cargar los grupos desde el servidor.");
      setAllGroups([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // ✅ Corregida la comparación de los estados de grupo
  const activeGroups = allGroups.filter(
    group => group.status === "active" || group.status === "pending"
  );

  // ✅ Corregida la comparación del estado de grupos completados
  const completedGroups = allGroups.filter(
    group => group.status === "completed"
  );

  return {
    activeGroups,
    completedGroups,
    totalActiveGroups: activeGroups.length,
    totalCompletedGroups: completedGroups.length,
    isLoading,
    error,
    refreshGroups: fetchGroups,
  };
};
