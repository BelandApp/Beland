import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { WalletAction } from "../types";
import { actionsStyles } from "../styles";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { CustomAlert } from "../../../components/ui/CustomAlert";

interface WalletActionsProps {
  actions: WalletAction[];
}

export const WalletActions: React.FC<WalletActionsProps> = ({ actions }) => {
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  const handlePress = (action: WalletAction) => {
    if (action.id === "exchange") {
      showCustomAlert(
        "Funcionalidad en progreso",
        "Esta funcionalidad estará disponible próximamente.",
        "info"
      );
    } else if (action.onPress) {
      action.onPress();
    }
  };

  return (
    <>
      <View style={actionsStyles.actionsContainer}>
        {actions.map((action) => {
          const IconComponent = action.icon;
          return (
            <TouchableOpacity
              key={action.id}
              style={actionsStyles.actionButton}
              onPress={() => handlePress(action)}
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
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </>
  );
};
