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
        <Button title="Ver todo" variant="link" onPress={onViewHistory} />
      </View>

      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </View>
  );
};
