import React from "react";
import {
  View,
  ScrollView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { AppHeader } from "../../components/layout/AppHeader";
import { RecyclingCard, CommunityCard, ActivitySection } from "./components";
import { RecyclingMapWidget } from "./components/RecyclingMapWidget";
import { useDashboardNavigation, useDashboardData } from "./hooks";

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
      <View
        style={[webStyles.container, { overflow: "scroll", height: "100%" }]}
      >
        <AppHeader />
        <RecyclingCard bottlesRecycled={userStats.bottlesRecycled} />
        <CommunityCard />
        <RecyclingMapWidget onPress={handleRecyclingMapPress} />
        <ActivitySection
          activities={activities}
          onViewHistory={handleViewHistory}
        />
      </View>
    );
  }

  // Mobile
  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader />
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <RecyclingCard bottlesRecycled={userStats.bottlesRecycled} />
          <CommunityCard />
          <RecyclingMapWidget onPress={handleRecyclingMapPress} />
          <ActivitySection
            activities={activities}
            onViewHistory={handleViewHistory}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    flexDirection: "column",
    paddingBottom: 86,
  },
});

const webStyles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    flexDirection: "column",
    paddingBottom: 86,
  },
});
