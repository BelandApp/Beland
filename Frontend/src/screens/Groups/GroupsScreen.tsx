import React from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackScreenProps } from "@react-navigation/stack";
import { GroupsStackParamList } from "../../types/navigation";
import { WaveBottomGray } from "../../components/icons";

// Hooks
import { useGroupsTabs, useGroupsNavigation, useGroupsData } from "./hooks";

// Components
import { GroupsHeader, GroupTabs, GroupsList } from "./components";

// Styles
import { containerStyles } from "./styles";

type GroupsScreenProps = StackScreenProps<GroupsStackParamList, "GroupsList">;

export const GroupsScreen: React.FC<GroupsScreenProps> = ({ navigation }) => {
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
  const currentGroups = isActiveTab ? activeGroups : completedGroups;

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
