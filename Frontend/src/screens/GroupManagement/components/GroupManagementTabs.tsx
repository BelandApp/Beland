import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { TabType } from "../types";
import { tabStyles } from "../styles";

interface GroupManagementTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const GroupManagementTabs: React.FC<GroupManagementTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={tabStyles.tabOuterContainer}>
      <View style={tabStyles.tabContainer}>
        <TouchableOpacity
          style={[
            tabStyles.tabButton,
            activeTab === "content" && tabStyles.activeTabButton,
          ]}
          onPress={() => onTabChange("content")}
          activeOpacity={0.8}
        >
          <View style={tabStyles.tabButtonContent}>
            <Text style={tabStyles.tabIcon}>📝</Text>
            <Text
              style={[
                tabStyles.tabButtonText,
                activeTab === "content" && tabStyles.activeTabButtonText,
              ]}
            >
              Contenido
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            tabStyles.tabButton,
            activeTab === "payment" && tabStyles.activeTabButton,
          ]}
          onPress={() => onTabChange("payment")}
          activeOpacity={0.8}
        >
          <View style={tabStyles.tabButtonContent}>
            <Text style={tabStyles.tabIcon}>💳</Text>
            <Text
              style={[
                tabStyles.tabButtonText,
                activeTab === "payment" && tabStyles.activeTabButtonText,
              ]}
            >
              Pagos
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
