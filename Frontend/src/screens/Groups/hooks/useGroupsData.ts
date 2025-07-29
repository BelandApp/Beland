import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { useGroups } from "../../../hooks/useGroups";
import { Group } from "../../../types";

export const useGroupsData = () => {
  const { getAllGroups, getActiveGroups, getCompletedGroups, refreshKey } =
    useGroups();

  // Usar useFocusEffect para refrescar cuando se vuelve a la pantalla
  useFocusEffect(
    React.useCallback(() => {
      // El hook useGroups ya maneja el refresh internamente
    }, [])
  );

  const activeGroups = getActiveGroups();
  const completedGroups = getCompletedGroups();
  const allGroups = getAllGroups();

  return {
    activeGroups,
    completedGroups,
    allGroups,
    refreshKey,
    hasActiveGroups: activeGroups.length > 0,
    hasCompletedGroups: completedGroups.length > 0,
    totalActiveGroups: activeGroups.length,
    totalCompletedGroups: completedGroups.length,
  };
};
