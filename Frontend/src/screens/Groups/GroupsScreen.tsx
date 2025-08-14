import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { GroupsStackParamList } from "../../types/navigation";
import { WaveBottomGray } from "../../components/icons";

// Hooks
import {
  useGroupsTabs,
  useGroupsNavigation,
  useGroupsData,
  useGroupTypeFilter,
} from "./hooks";

// Components
import {
  GroupsHeader,
  GroupTabs,
  GroupsList,
  GroupTypeFilter,
} from "./components";

// Styles
import { containerStyles } from "./styles";

export const GroupsScreen: React.FC<any> = (props) => {
  // Hooks personalizados
  const { selectedTab, setSelectedTab, isActiveTab } = useGroupsTabs();
  const { navigateToCreateGroup, navigateToGroupManagement } =
    useGroupsNavigation();
  const {
    activeGroups,
    completedGroups,
    hasActiveGroups,
    hasCompletedGroups,
    totalActiveGroups,
    totalCompletedGroups,
  } = useGroupsData();

  // Determinar qué grupos mostrar según la pestaña seleccionada
  const baseGroups = isActiveTab ? activeGroups : completedGroups;

  // Hook para filtrar por tipo
  const {
    selectedType,
    availableTypes,
    filteredGroups,
    handleTypeChange,
    hasActiveFilter,
  } = useGroupTypeFilter(baseGroups);

  // Los grupos a mostrar son los filtrados
  const currentGroups = filteredGroups;

  return (
    <SafeAreaView style={containerStyles.container} edges={[]}>
      <ScrollView style={containerStyles.scrollView}>
        <View style={containerStyles.content}>
          {/* Header con título y botón crear */}
          <GroupsHeader onCreateGroup={navigateToCreateGroup} />

          {/* Pestañas de navegación */}
          <GroupTabs
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            activeCount={totalActiveGroups}
            historyCount={totalCompletedGroups}
          />

          {/* Filtro por tipo de grupo */}
          {availableTypes.length > 0 && (
            <GroupTypeFilter
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              availableTypes={availableTypes}
            />
          )}

          {/* Lista de grupos */}
          <GroupsList
            groups={currentGroups}
            onGroupPress={navigateToGroupManagement}
            emptyStateType={selectedTab}
          />
        </View>
      </ScrollView>

      {/* Ola de fondo */}
      <View style={containerStyles.waveContainer}>
        <WaveBottomGray width={Dimensions.get("window").width} height={120} />
      </View>
    </SafeAreaView>
  );
};
