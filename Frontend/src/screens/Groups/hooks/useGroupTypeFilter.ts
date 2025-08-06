import { useState, useMemo } from "react";
import { Group } from "../../../types";

export const useGroupTypeFilter = (groups: Group[]) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Obtener todos los tipos únicos disponibles en los grupos
  const availableTypes = useMemo(() => {
    const types = groups.map((group) => group.type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [groups]);

  // Filtrar grupos por tipo seleccionado
  const filteredGroups = useMemo(() => {
    if (!selectedType) {
      return groups;
    }
    return groups.filter((group) => group.type === selectedType);
  }, [groups, selectedType]);

  // Función para cambiar el tipo seleccionado
  const handleTypeChange = (type: string | null) => {
    setSelectedType(type);
  };

  // Función para limpiar el filtro
  const clearFilter = () => {
    setSelectedType(null);
  };

  return {
    selectedType,
    availableTypes,
    filteredGroups,
    handleTypeChange,
    clearFilter,
    hasActiveFilter: selectedType !== null,
  };
};
