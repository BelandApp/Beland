import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { Group } from "../../../types";
import { useGroups } from "../../Groups/hooks/useGroups";
import { CURRENT_USER_ID } from "../../../data/user";

export const useGroupManagementData = (groupId: string, navigation: any) => {
  const { getGroupById, refreshKey } = useGroups();
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);

  // Determinar si el usuario actual es el administrador del grupo
  const isGroupAdmin = currentGroup?.createdBy === CURRENT_USER_ID;

  useEffect(() => {
    const group = getGroupById(groupId);
    if (group) {
      setCurrentGroup(group);
    } else {
      Alert.alert("Error", "Grupo no encontrado", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  }, [groupId, getGroupById, navigation, refreshKey]);

  const handleGroupUpdated = (updatedGroup: Group) => {
    setCurrentGroup(updatedGroup);
    // También actualizar los datos desde el storage para asegurar consistencia
    setTimeout(() => {
      const freshGroup = getGroupById(groupId);
      if (freshGroup) {
        setCurrentGroup(freshGroup);
      }
    }, 100);
  };

  return {
    currentGroup,
    isGroupAdmin,
    handleGroupUpdated,
  };
};
