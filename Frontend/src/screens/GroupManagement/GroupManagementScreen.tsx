import React from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { GroupManagementScreenProps } from "./types";
import { useGroupManagementData, useGroupManagementTabs } from "./hooks";
import {
  GroupManagementHeader,
  GroupManagementTabs,
  GroupManagementContent,
} from "./components";
import { containerStyles } from "./styles";
import { colors } from "../../styles/colors";
import { commonStyles } from "../../styles/commonStyles";

export const GroupManagementScreen: React.FC<GroupManagementScreenProps> = ({
  route,
  navigation,
}) => {
  const { groupId } = route.params;
  const { currentGroup, isGroupAdmin, handleGroupUpdated } =
    useGroupManagementData(groupId, navigation);
  const { activeTab, setActiveTab } = useGroupManagementTabs();

  if (!currentGroup) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={containerStyles.loadingContainer}>
          <Text style={containerStyles.loadingText}>Cargando grupo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        style={containerStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <GroupManagementHeader
          currentGroup={currentGroup}
          isGroupAdmin={isGroupAdmin}
          onBackPress={() => navigation.goBack()}
        />
        <GroupManagementTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <View style={containerStyles.tabContent}>
          <GroupManagementContent
            currentGroup={currentGroup}
            activeTab={activeTab}
            isGroupAdmin={isGroupAdmin}
            onGroupUpdated={handleGroupUpdated}
            navigation={navigation}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
