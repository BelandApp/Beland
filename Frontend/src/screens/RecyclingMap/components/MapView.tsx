import React, { useRef, useEffect, useState } from "react";
import { View, Text, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { styles } from "@screens/RecyclingMap/styles/MapStyles";
import { useRecyclingMapContext } from "../context/RecyclingMapContext";
let MapViewWeb: any = null;
if (Platform.OS === "web") {
  MapViewWeb = require("./MapViewWeb").MapViewWeb;
}

export const MapView = () => {
  const { filteredPoints, selectedPoint, userLocation, handlePointPress } =
    useRecyclingMapContext();
  if (Platform.OS === "web" && MapViewWeb) {
    return (
      <MapViewWeb
        userLocation={userLocation}
        points={filteredPoints.map((point: any) => ({
          ...point,
          isSelected: selectedPoint?.id === point.id,
          isNearest:
            selectedPoint === null &&
            filteredPoints.length > 0 &&
            point.id === filteredPoints[0].id,
        }))}
        selectedPointId={selectedPoint?.id || null}
        onSelectPoint={(id: string) => {
          const point = filteredPoints.find((p: any) => p.id === id);
          if (point) handlePointPress(point);
        }}
      />
    );
  }

  const webViewRef = useRef<WebView>(null);
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    if (userLocation && filteredPoints.length > 0 && webViewRef.current) {
      updateMapData();
    }
  }, [userLocation, filteredPoints, selectedPoint?.id]);

  const updateMapData = () => {
    if (!webViewRef.current || !userLocation) return;
    const points = filteredPoints.map((point: any) => {
      const isSelected = selectedPoint?.id === point.id;
      return {
        ...point,
        isSelected,
        isNearest:
          selectedPoint === null &&
          filteredPoints.length > 0 &&
          point.id === filteredPoints[0].id,
      };
    });
    const message = {
      type: "updateData",
      userLocation: userLocation,
      points: points,
      selectedPointId: selectedPoint?.id || null,
    };
    const jsCode = `
      (function() {
        try {
          const data = ${JSON.stringify(message)};
          if (typeof updateMapData === 'function') {
            updateMapData(data);
          } else if (typeof window.updateMapData === 'function') {
            window.updateMapData(data);
          }
        } catch (error) {}
      })();
      true;
    `;
    webViewRef.current.injectJavaScript(jsCode);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "debug") {
        return;
      }
      switch (data.type) {
        case "mapLoaded":
          setIsMapLoading(false);
          setTimeout(() => {
            updateMapData();
          }, 500);
          break;
        case "markerClicked":
          if (data.pointId) {
            const point = filteredPoints.find(
              (p: any) => p.id === data.pointId
            );
            if (point) handlePointPress(point);
          }
          break;
      }
    } catch (error) {
      // Silenciar errores de parseo
    }
  };

  const mapHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body, html { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #map { height: 100%; width: 100%; }
        .recycling-marker { background: #22C55E; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer; transition: all 0.2s ease; }
        .recycling-marker:hover { transform: scale(1.1); }
        .recycling-marker.selected { background: #3B82F6; width: 32px; height: 32px; font-size: 14px; border-width: 4px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
        .recycling-marker.nearest { background: #F88D2A; width: 28px; height: 28px; font-size: 13px; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(248, 141, 42, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(248, 141, 42, 0); } 100% { box-shadow: 0 0 0 0 rgba(248, 141, 42, 0); } }
        .user-location { background: #1E40AF; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(30, 64, 175, 0.4); animation: userPulse 2s infinite; }
        @keyframes userPulse { 0% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(30, 64, 175, 0); } 100% { box-shadow: 0 0 0 0 rgba(30, 64, 175, 0); } }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        (function() {
          function logToRN(message, data) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', message: message, data: data }));
            }
          }
          function initMap() {
            var map = L.map('map', { zoomControl: true, attributionControl: false }).setView([-34.6037, -58.3816], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
            window._nativeMap = map;
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapLoaded' }));
            }
            window.updateMapData = function(data) {
              if (!map) return;
              if (window._userMarker) { map.removeLayer(window._userMarker); }
              if (window._pointMarkers) { window._pointMarkers.forEach(function(marker) { map.removeLayer(marker); }); }
              window._pointMarkers = [];
              if (data.userLocation) {
                window._userMarker = L.marker([data.userLocation.latitude, data.userLocation.longitude], { icon: L.divIcon({ html: '<div class="user-location"></div>', className: '', iconSize: [22, 22], iconAnchor: [11, 11] }) }).addTo(map);
              }
              if (data.points && data.points.length > 0) {
                data.points.forEach(function(point) {
                  var className = 'recycling-marker';
                  if (point.isSelected) className += ' selected';
                  else if (point.isNearest) className += ' nearest';
                  var marker = L.marker([point.latitude, point.longitude], { icon: L.divIcon({ html: '<div class="' + className + '">♻️</div>', className: '', iconSize: [32, 32], iconAnchor: [16, 16] }) }).addTo(map);
                  marker.pointId = point.id;
                  marker.on('click', function() {
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClicked', pointId: point.id }));
                    }
                  });
                  marker.bindPopup('<div style="text-align: center; padding: 5px;"><strong>' + point.name + '</strong><br><small>' + point.address + '</small>' + (point.isNearest ? '<br><span style="color: #F88D2A; font-weight: bold;">Más cercano</span>' : '') + '</div>');
                  window._pointMarkers.push(marker);
                });
              }
              var centerLat, centerLng, zoomLevel = 13;
              if (data.selectedPointId) {
                var selectedPoint = data.points && data.points.find(function(p) { return p.id === data.selectedPointId; });
                if (selectedPoint) {
                  centerLat = selectedPoint.latitude;
                  centerLng = selectedPoint.longitude;
                  zoomLevel = 15;
                } else if (data.userLocation) {
                  centerLat = data.userLocation.latitude;
                  centerLng = data.userLocation.longitude;
                }
              } else if (data.userLocation) {
                centerLat = data.userLocation.latitude;
                centerLng = data.userLocation.longitude;
              }
              if (centerLat && centerLng) {
                map.setView([centerLat, centerLng], zoomLevel);
              }
            };
          }
          if (document.readyState === 'complete' || document.readyState === 'interactive') {
            initMap();
          } else {
            window.addEventListener('DOMContentLoaded', initMap);
          }
        })();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.mapContainer}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webView}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onLoadEnd={() => setIsMapLoading(false)}
      />

      {isMapLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      )}

      <View style={styles.mapInfo}>
        <Text style={styles.mapInfoText}>{filteredPoints.length} puntos</Text>
      </View>
    </View>
  );
};
