import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WalletAction } from "../types";
import { actionsStyles } from "../styles";

interface WalletActionsProps {
  actions: WalletAction[];
}

export const WalletActions: React.FC<WalletActionsProps> = ({ actions }) => {
  return (
    <View style={actionsStyles.actionsContainer}>
      {actions.map((action) => {
        const IconComponent = action.icon;
        return (
          <TouchableOpacity
            key={action.id}
            style={actionsStyles.actionButton}
            onPress={action.onPress}
          >
            <View
              style={[
                actionsStyles.actionIcon,
                { backgroundColor: action.backgroundColor || "#FFFFFF" },
              ]}
            >
              <IconComponent
                width={24}
                height={action.id === "exchange" ? 18 : 22}
              />
            </View>
            <Text style={actionsStyles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
