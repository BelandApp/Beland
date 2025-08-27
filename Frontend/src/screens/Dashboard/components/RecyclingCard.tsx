import React from "react";
import { View, Text } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BottleIcon, TreesIcon } from "../../../components/icons";
import { colors } from "../../../styles/colors";
import { recyclingCardStyles } from "../styles";

interface RecyclingCardProps {
  bottlesRecycled: number;
}

export const RecyclingCard: React.FC<RecyclingCardProps> = ({
  bottlesRecycled,
}) => {
  return (
    <Card
      style={recyclingCardStyles.recyclingCard}
      backgroundColor={colors.belandGreenLight}
    >
      <View style={recyclingCardStyles.recyclingContent}>
        <View style={recyclingCardStyles.recyclingLeft}>
          <View style={recyclingCardStyles.iconContainer}>
            <BottleIcon width={48} height={64} />
          </View>
          <View>
            <Text style={recyclingCardStyles.recyclingTitle}>Reciclaste</Text>
            <View style={recyclingCardStyles.recyclingStats}>
              {bottlesRecycled > 0 ? (
                <>
                  <Text style={recyclingCardStyles.recyclingNumber}>
                    {bottlesRecycled}
                  </Text>
                  <Text style={recyclingCardStyles.recyclingLabel}>
                    botellas
                  </Text>
                </>
              ) : (
                <Text style={recyclingCardStyles.recyclingLabel}>
                  Aún no has reciclado botellas. ¡Comienza a reciclar y verás tu
                  progreso aquí!
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={recyclingCardStyles.treesIconContainer}>
          <TreesIcon width={80} height={64} />
        </View>
      </View>
    </Card>
  );
};
