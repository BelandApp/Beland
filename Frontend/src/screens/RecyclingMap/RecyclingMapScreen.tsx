import React from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { StatusHeader } from "./components/StatusHeader";
import { SearchBar } from "./components/SearchBar";
import { FilterChips } from "./components/FilterChips";
import { MapView } from "./components/MapView";
import { PointCard } from "./components/PointCard";
import { styles } from "@screens/RecyclingMap/styles/RecyclingMapStyles";
import { useRecyclingMapContext } from "./context/RecyclingMapContext";
import { RecyclingMapProvider } from "./context/RecyclingMapContext";

export const RecyclingMapScreen = () => {
  return (
    <RecyclingMapProvider>
      <RecyclingMapScreenContent />
    </RecyclingMapProvider>
  );
};

const RecyclingMapScreenContent = () => {
  const {
    filteredPoints,
    selectedPoint,
    scrollViewRef,
    handlePointPress,
    searchQuery,
    setSearchQuery,
    selectedFilters,
    toggleFilter,
    handleDirections,
  } = useRecyclingMapContext();

  if (typeof window !== "undefined" && window.document) {
    const isMobileWeb = window.innerWidth < 600;
    if (isMobileWeb) {
      // Layout vertical para web móvil
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            height: "100vh",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 300,
              minHeight: 180,
              maxHeight: 350,
              flexShrink: 0,
              overflow: "hidden",
              zIndex: 1,
              position: "relative",
            }}
          >
            <MapView />
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: 0,
              overflowY: "auto",
              boxSizing: "border-box",
              paddingBottom: 40,
              background: "#fff",
              maxHeight: "calc(100vh - 300px)",
              zIndex: 2,
              position: "relative",
            }}
          >
            <StatusHeader pointCount={filteredPoints.length} />
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <FilterChips
              selectedFilters={selectedFilters}
              toggleFilter={toggleFilter}
            />
            <ScrollView ref={scrollViewRef} style={styles.pointsList}>
              {filteredPoints.map((point: any) => (
                <PointCard
                  key={point.id}
                  point={point}
                  isSelected={selectedPoint?.id === point.id}
                  onPress={() => handlePointPress(point)}
                  onDirectionsPress={() => handleDirections(point)}
                />
              ))}
            </ScrollView>
          </div>
        </div>
      );
    }
    // Desktop web: layout horizontal
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          height: "100vh",
          background: "#f8fafc",
        }}
      >
        <div style={{ flex: 2, minWidth: 0, padding: 0 }}>
          <MapView />
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: 0,
            overflowY: "auto",
            height: "100vh",
            boxSizing: "border-box",
            paddingBottom: 40,
          }}
        >
          <StatusHeader pointCount={filteredPoints.length} />
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          <FilterChips
            selectedFilters={selectedFilters}
            toggleFilter={toggleFilter}
          />
          <ScrollView ref={scrollViewRef} style={styles.pointsList}>
            {filteredPoints.map((point: any) => (
              <PointCard
                key={point.id}
                point={point}
                isSelected={selectedPoint?.id === point.id}
                onPress={() => handlePointPress(point)}
                onDirectionsPress={() => handleDirections(point)}
              />
            ))}
          </ScrollView>
        </div>
      </div>
    );
  }
  // Vista mobile: diseño vertical tradicional
  return (
    <SafeAreaView style={styles.container}>
      <StatusHeader pointCount={filteredPoints.length} />
      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FilterChips
        selectedFilters={selectedFilters}
        toggleFilter={toggleFilter}
      />
      <MapView />
      <ScrollView ref={scrollViewRef} style={styles.pointsList}>
        {filteredPoints.map((point: any) => (
          <PointCard
            key={point.id}
            point={point}
            isSelected={selectedPoint?.id === point.id}
            onPress={() => handlePointPress(point)}
            onDirectionsPress={() => handleDirections(point)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};
