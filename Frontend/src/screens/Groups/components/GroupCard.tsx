import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "../../../components/ui/Card";
import { BeCoinIcon } from "../../../components/icons/BeCoinIcon";
import { GroupIcon } from "../../../components/icons";
import { colors } from "../../../styles/colors";
import { Group } from "../../../types";
import { groupCardStyles, buttonStyles } from "../styles";
import { useGroupsUtils } from "../hooks";
import { CURRENCY_CONFIG } from "../../../constants";

interface GroupCardProps {
  group: Group;
  onPress: (groupId: string) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({ group, onPress }) => {
  const { getStatusColor, getStatusText, formatAmount } = useGroupsUtils();

  return (
    <TouchableOpacity
      key={group.id}
      style={groupCardStyles.groupCard}
      activeOpacity={0.8}
      onPress={() => onPress(group.id)}
    >
      <Card style={groupCardStyles.cardContent}>
        <View style={groupCardStyles.groupHeader}>
          <View style={groupCardStyles.groupTitleContainer}>
            <GroupIcon width={20} height={20} color={colors.belandOrange} />
            <Text style={groupCardStyles.groupName}>{group.name}</Text>
          </View>
          <View style={groupCardStyles.badgeContainer}>
            <View
              style={[
                groupCardStyles.typeBadge,
                { backgroundColor: "#f0f0f0" },
              ]}
            >
              <Text style={groupCardStyles.typeText}>{group.type}</Text>
            </View>
            <View
              style={[
                groupCardStyles.statusBadge,
                { backgroundColor: getStatusColor(group.status) },
              ]}
            >
              <Text style={groupCardStyles.statusText}>
                {getStatusText(group.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={groupCardStyles.groupInfo}>
          <Text style={groupCardStyles.participants}>
            👥 {group.totalParticipants} participantes
          </Text>
          <Text style={groupCardStyles.location}>📍 {group.location}</Text>
          <Text style={groupCardStyles.deliveryTime}>
            🕐 {group.deliveryTime}
          </Text>
        </View>

        <View style={groupCardStyles.amountInfo}>
          <View style={groupCardStyles.totalAmount}>
            <Text style={groupCardStyles.amountLabel}>Total del grupo:</Text>
            <View style={groupCardStyles.amountContainer}>
              <BeCoinIcon width={16} height={16} />
              <Text style={groupCardStyles.amountValue}>
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                {formatAmount(group.totalAmount)}
              </Text>
            </View>
          </View>
          <View style={groupCardStyles.myAmount}>
            <Text style={groupCardStyles.myAmountLabel}>Mi parte:</Text>
            <View style={groupCardStyles.amountContainer}>
              <BeCoinIcon width={14} height={14} />
              <Text style={groupCardStyles.myAmountValue}>
                {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                {formatAmount(group.myConsumption)}
              </Text>
            </View>
          </View>
        </View>

        <View style={groupCardStyles.productsList}>
          <Text style={groupCardStyles.productsTitle}>Productos:</Text>
          {group.products.slice(0, 2).map((product: any, index: number) => (
            <Text
              key={`${group.id}-product-${index}`}
              style={groupCardStyles.productItem}
            >
              • {product.name}
            </Text>
          ))}
          {group.products.length > 2 && (
            <Text style={groupCardStyles.moreProducts}>
              +{group.products.length - 2} productos más
            </Text>
          )}
        </View>

        {group.status === "pending_payment" && (
          <TouchableOpacity style={buttonStyles.payButton} activeOpacity={0.8}>
            <Text style={buttonStyles.payButtonText}>Pagar Mi Parte</Text>
          </TouchableOpacity>
        )}
      </Card>
    </TouchableOpacity>
  );
};
