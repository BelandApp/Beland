import React from "react";
import { View, Text, TouchableOpacity, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Group } from "../../../types";
import { colors } from "../../../styles/colors";
import { headerStyles } from "../styles";
import { formatUSDPrice, CURRENCY_CONFIG } from "../../../constants";

interface GroupManagementHeaderProps {
  currentGroup: Group | null;
  isGroupAdmin: boolean;
  onBackPress: () => void;
}

export const GroupManagementHeader: React.FC<GroupManagementHeaderProps> = ({
  currentGroup,
  isGroupAdmin,
  onBackPress,
}) => {
  return (
    <LinearGradient
      colors={[colors.primary, colors.belandOrange, "#FF9A3D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={headerStyles.headerGradient}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Back Button */}
      <TouchableOpacity
        style={headerStyles.backButton}
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <View style={headerStyles.backButtonContainer}>
          <Text style={headerStyles.backButtonIcon}>←</Text>
          <Text style={headerStyles.backButtonText}>Volver</Text>
        </View>
      </TouchableOpacity>

      {/* Group Info Card */}
      <View style={headerStyles.groupInfoCard}>
        <View style={headerStyles.groupTitleContainer}>
          <Text style={headerStyles.groupName}>{currentGroup?.name}</Text>
          {isGroupAdmin && (
            <View style={headerStyles.adminBadge}>
              <Text style={headerStyles.adminBadgeText}>👑 Admin</Text>
            </View>
          )}
        </View>

        <View style={headerStyles.groupDetailsContainer}>
          {currentGroup?.description && (
            <View style={headerStyles.detailItemFull}>
              <Text style={headerStyles.detailIcon}>📝</Text>
              <Text
                style={headerStyles.groupDescription}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {currentGroup.description}
              </Text>
            </View>
          )}
          <View style={headerStyles.detailItemFull}>
            <Text style={headerStyles.detailIcon}>📍</Text>
            <Text
              style={headerStyles.groupLocation}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {currentGroup?.location}
            </Text>
          </View>
          <View style={headerStyles.detailItemFull}>
            <Text style={headerStyles.detailIcon}>🕐</Text>
            <Text style={headerStyles.groupDelivery}>
              {currentGroup?.deliveryTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={headerStyles.statsContainer}>
        <View style={headerStyles.statCard}>
          <View style={headerStyles.statIconContainer}>
            <Text style={headerStyles.statIcon}>👥</Text>
          </View>
          <Text style={headerStyles.statValue} numberOfLines={1}>
            {currentGroup?.totalParticipants}
          </Text>
          <Text style={headerStyles.statLabel} numberOfLines={1}>
            Participantes
          </Text>
        </View>

        <View style={headerStyles.statCard}>
          <View style={headerStyles.statIconContainer}>
            <Text style={headerStyles.statIcon}>💰</Text>
          </View>
          <Text style={headerStyles.statValue} numberOfLines={1}>
            {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
            {formatUSDPrice(currentGroup?.totalAmount || 0)}
          </Text>
          <Text style={headerStyles.statLabel} numberOfLines={1}>
            Total
          </Text>
        </View>

        <View style={headerStyles.statCard}>
          <View style={headerStyles.statIconContainer}>
            <Text style={headerStyles.statIcon}>🧾</Text>
          </View>
          <Text style={headerStyles.statValue} numberOfLines={1}>
            {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
            {formatUSDPrice(currentGroup?.myConsumption || 0)}
          </Text>
          <Text style={headerStyles.statLabel} numberOfLines={1}>
            Tu parte
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};
