import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { headerStyles } from "../styles";

export const WalletHeader: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={headerStyles.titleContainer}>
      <Text style={headerStyles.sectionTitle}>Billetera</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("WalletSettingsScreen" as never)}
        style={{
          padding: 8,
          borderRadius: 8,
          backgroundColor: "rgba(248, 141, 42, 0.1)",
        }}
      >
        <MaterialCommunityIcons name="cog" size={24} color="#F88D2A" />
      </TouchableOpacity>
    </View>
  );
};
