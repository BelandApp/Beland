import React from "react";
import { View, ScrollView } from "react-native";
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

  return (
    <View style={containerStyles.container}>
      <ScrollView style={containerStyles.scrollView}>
        {/* Header */}
        <AppHeader
          userName={userStats.userName}
          onMenuPress={handleMenuPress}
          onCoinsPress={handleCoinsPress}
        />

        {/* Contenido principal */}
        <View style={containerStyles.content}>
          {/* Tarjeta de Reciclaje */}
          <RecyclingCard bottlesRecycled={userStats.bottlesRecycled} />

          {/* Recompensas */}
          <RewardsCard />

          {/* Mapa de Puntos de Reciclaje */}
          <RecyclingMapWidget onPress={handleRecyclingMapPress} />

          {/* Última actividad */}
          <ActivitySection
            activities={activities}
            onViewHistory={handleViewHistory}
          />
        </View>
      </ScrollView>
    </View>
  );
};
