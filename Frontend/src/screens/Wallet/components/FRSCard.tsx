import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { FRSData } from "../types";
import { frsCardStyles } from "../styles";

interface FRSCardProps {
  frsData: FRSData;
}

export const FRSCard: React.FC<FRSCardProps> = ({ frsData }) => {
  return (
    <Card style={frsCardStyles.frsCard}>
      <View style={frsCardStyles.frsContent}>
        <View style={frsCardStyles.frsIcon}>
          <Text style={frsCardStyles.frsIconText}>F</Text>
        </View>
        <View style={frsCardStyles.frsInfo}>
          <Text style={frsCardStyles.frsTitle}>{frsData.title}</Text>
          <Text style={frsCardStyles.frsSubtitle}>{frsData.rating}</Text>
        </View>
        <View style={frsCardStyles.frsAmounts}>
          <Text style={frsCardStyles.frsAmount}>{frsData.amount}</Text>
          <Text style={frsCardStyles.frsRate}>{frsData.rate}</Text>
          <Text style={frsCardStyles.frsDetails}>{frsData.details}</Text>
        </View>
        <TouchableOpacity style={frsCardStyles.frsNotification}>
          <Text style={frsCardStyles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};
