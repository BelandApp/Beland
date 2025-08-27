import React from "react";
import { View, Text } from "react-native";
import { Button } from "../../../components/ui/Button";
import { Activity } from "../types";
import { ActivityCard } from "./ActivityCard";
import { activityStyles } from "../styles";

interface ActivitySectionProps {
  activities: Activity[];
  onViewHistory: () => void;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  activities,
  onViewHistory,
}) => {
  return (
    <View style={activityStyles.activitySection}>
      <View style={activityStyles.activityHeader}>
        <Text style={activityStyles.activityTitle}>Última actividad</Text>
      </View>
      {activities.length === 0 ? (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ color: "#888", fontSize: 15 }}>
            Sin actividad registrada
          </Text>
          <Text style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            Tu actividad aparecerá aquí cuando uses la app.
          </Text>
        </View>
      ) : (
        activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))
      )}
    </View>
  );
};
