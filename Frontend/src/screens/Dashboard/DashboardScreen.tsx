import React from "react";
import { View, ScrollView, Platform } from "react-native";
import { AppHeader } from "../../components/layout/AppHeader";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import { RecyclingCard, RewardsCard, ActivitySection } from "./components";
import { RecyclingMapWidget } from "./components/RecyclingMapWidget";
import { useDashboardNavigation, useDashboardData } from "./hooks";
import { containerStyles } from "./styles";

export const DashboardScreen = () => {
  const {
    handleMenuPress,
    handleViewHistory,
    handleCoinsPress,
    handleRecyclingMapPress,
  } = useDashboardNavigation();
  const { userStats, activities } = useDashboardData();

  if (Platform.OS === "web") {
    return (
      <div className="sidebar-content">
        <div
          style={{
            padding: 16,
            gap: 16,
            display: "flex",
            flexDirection: "column",
            paddingBottom: 86,
          }}
        >
          <AppHeader />
          <RecyclingCard bottlesRecycled={userStats.bottlesRecycled} />
          <RewardsCard />
          <RecyclingMapWidget onPress={handleRecyclingMapPress} />
          <ActivitySection
            activities={activities}
            onViewHistory={handleViewHistory}
          />
        </div>
      </div>
    );
  }
  // Mobile
  return (
    <View style={containerStyles.container}>
      <ScrollView style={containerStyles.scrollView}>
        {/* Header */}
        <AppHeader />
        {/* Contenido principal */}
        <View style={containerStyles.content}>
          <RecyclingCard bottlesRecycled={userStats.bottlesRecycled} />
          <RewardsCard />
          <RecyclingMapWidget onPress={handleRecyclingMapPress} />
          <ActivitySection
            activities={activities}
            onViewHistory={handleViewHistory}
          />
        </View>
      </ScrollView>
    </View>
  );
};
