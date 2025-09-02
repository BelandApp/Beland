import React from "react";
import { View, Text } from "react-native";
import { headerStyles } from "../styles";

export const CommunityHeader: React.FC = () => {
  return (
    <View style={headerStyles.titleContainer}>
      <Text style={headerStyles.sectionTitle}>Comunidad</Text>
    </View>
  );
};
