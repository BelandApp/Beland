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
    // Vista web: mapa a la izquierda y lista original a la derecha
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
