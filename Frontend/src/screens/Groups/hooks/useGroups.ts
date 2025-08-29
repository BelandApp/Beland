import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Group } from "../../../types/Group";
import { GroupService } from "../../../services/groupService";

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiResponse = await GroupService.getGroupsFromApi();
      setGroups(apiResponse.groups || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar los grupos desde la API.");
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, refreshKey]);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, [])
  );

  const getAllGroups = () => groups;

  const getActiveGroups = () =>
    groups.filter(
      (group) => group.status === "active" || group.status === "pending"
    );

  const getCompletedGroups = () =>
    groups.filter((group) => group.status === "completed");

  const getGroupById = (id: string) => groups.find((group) => group.id === id);

  return {
    getAllGroups,
    getActiveGroups,
    getCompletedGroups,
    getGroupById,
    refreshKey,
    loading,
    error,
  };
};
