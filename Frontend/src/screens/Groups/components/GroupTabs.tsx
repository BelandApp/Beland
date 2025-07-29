import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { tabStyles } from "../styles";
import { TabType } from "../hooks/useGroupsTabs";

interface GroupTabsProps {
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeCount?: number;
  historyCount?: number;
}

export const GroupTabs: React.FC<GroupTabsProps> = ({
  selectedTab,
  onTabChange,
  activeCount = 0,
  historyCount = 0,
}) => {
  return (
    <View style={tabStyles.tabsContainer}>
      <TouchableOpacity
        style={[tabStyles.tab, selectedTab === "active" && tabStyles.activeTab]}
        onPress={() => onTabChange("active")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            tabStyles.tabText,
            selectedTab === "active" && tabStyles.activeTabText,
          ]}
        >
          Activos ({activeCount})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          tabStyles.tab,
          selectedTab === "history" && tabStyles.activeTab,
        ]}
        onPress={() => onTabChange("history")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            tabStyles.tabText,
            selectedTab === "history" && tabStyles.activeTabText,
          ]}
        >
          Historial ({historyCount})
        </Text>
      </TouchableOpacity>
    </View>
  );
};
