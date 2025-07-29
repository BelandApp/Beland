import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BottleIcon, GiftIcon } from "../../../components/icons";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { Activity } from "../types";
import { activityStyles } from "../styles";

interface ActivityCardProps {
  activity: Activity;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <Card style={activityStyles.activityCard}>
      <View style={activityStyles.activityContent}>
        <View style={activityStyles.activityLeft}>
          <View
            style={[
              activityStyles.activityIcon,
              activity.type === "spend" && activityStyles.activityIconSpend,
            ]}
          >
            {activity.type === "spend" ? (
              <GiftIcon width={20} height={20} color="#F44336" />
            ) : (
              <BottleIcon width={20} height={20} />
            )}
          </View>
          <View>
            <Text style={activityStyles.activityAction}>{activity.action}</Text>
            <Text style={activityStyles.activityLocation}>
              {activity.location}
            </Text>
          </View>
        </View>
        <View style={activityStyles.activityRight}>
          <View style={activityStyles.coinsContainer}>
            <BeCoinIcon width={16} height={16} />
            <Text
              style={[
                activityStyles.activityCoins,
                activity.type === "spend" && activityStyles.activityCoinsSpend,
              ]}
            >
              {activity.type === "spend" ? "-" : "+"}
              {activity.coins}
            </Text>
          </View>
          <Text style={activityStyles.activityDate}>{activity.date}</Text>
        </View>
      </View>
    </Card>
  );
};
