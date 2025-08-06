import React, { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Card } from "../../components/ui/Card";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { ConfirmationAlert } from "../../components/ui/ConfirmationAlert";
import { colors } from "../../styles/colors";
import { Reward } from "./types";
import { useCustomAlert } from "../../hooks/useCustomAlert";

// Hooks
import {
  useRewardCategories,
  useRewardsFiltering,
  useUserBalance,
} from "./hooks";

// Components
import { RewardsHeader, CategoryFilter, RewardsGrid } from "./components";

// Styles
import { containerStyles } from "./styles";

export const RewardsScreen = () => {
  // Hooks personalizados
  const { selectedCategory, selectCategory } = useRewardCategories();
  const { filteredRewards } = useRewardsFiltering(selectedCategory);
  const { userBalance, canAffordReward, spendCoins, formatBalance } =
    useUserBalance();
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  // Estado para manejar la confirmación del canje
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Función para manejar el canje de recompensas
  const handleClaimReward = (reward: Reward) => {
    if (!reward.available) {
      showCustomAlert(
        "Recompensa agotada",
        "Esta recompensa ya no está disponible.",
        "error"
      );
      return;
    }

    if (!canAffordReward(reward)) {
      showCustomAlert(
        "Saldo insuficiente",
        `Necesitas ${reward.cost} BeCoins para canjear esta recompensa. Tu saldo actual es ${userBalance} BeCoins.`,
        "error"
      );
      return;
    }

    // Mostrar confirmación personalizada
    setPendingReward(reward);
    setShowConfirmation(true);
  };

  // Función para confirmar el canje después del alert
  const confirmRewardClaim = () => {
    if (!pendingReward) return;

    const success = spendCoins(
      pendingReward.cost,
      pendingReward.title,
      pendingReward.id.toString()
    );

    if (success) {
      // Obtener el balance actualizado después del gasto
      const newBalance = userBalance - pendingReward.cost;
      showCustomAlert(
        "¡Canje exitoso!",
        `Has canjeado "${pendingReward.title}". Tu nuevo saldo es ${newBalance} BeCoins.`,
        "success"
      );
    } else {
      showCustomAlert(
        "Error",
        "No tienes suficientes BeCoins para este canje.",
        "error"
      );
    }

    // Limpiar estado
    setPendingReward(null);
    setShowConfirmation(false);
  };

  const cancelRewardClaim = () => {
    setPendingReward(null);
    setShowConfirmation(false);
  };

  const getSectionTitle = () => {
    return selectedCategory === "Todos"
      ? "Todas las recompensas"
      : selectedCategory;
  };

  return (
    <View style={containerStyles.container}>
      {/* Header fijo */}
      <RewardsHeader />

      <ScrollView
        style={containerStyles.scrollView}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {/* Filtro de categorías */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={selectCategory}
        />

        {/* Banner destacado */}
        <View style={containerStyles.featuredSection}>
          <Card
            style={containerStyles.featuredCard}
            backgroundColor={colors.belandOrange + "25"}
          >
            <View style={containerStyles.featuredContent}>
              <View style={containerStyles.featuredText}>
                <Text style={containerStyles.featuredTitle}>
                  ¡Ofertas especiales!
                </Text>
                <Text style={containerStyles.featuredSubtitle}>
                  Descuentos exclusivos por reciclar
                </Text>
              </View>
              <View style={containerStyles.featuredBadge}>
                <Text style={containerStyles.featuredBadgeText}>NUEVO</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Grilla de recompensas */}
        <RewardsGrid
          rewards={filteredRewards}
          canAffordReward={canAffordReward}
          onClaimReward={handleClaimReward}
          sectionTitle={getSectionTitle()}
        />

        <View style={containerStyles.bottomSpacing} />
      </ScrollView>

      {/* ConfirmationAlert para canje */}
      <ConfirmationAlert
        visible={showConfirmation}
        title="Confirmar canje"
        message={`¿Deseas canjear "${pendingReward?.title}" por ${pendingReward?.cost} BeCoins?`}
        onConfirm={confirmRewardClaim}
        onCancel={cancelRewardClaim}
        confirmText="Canjear"
        cancelText="Cancelar"
        type="info"
        icon="🎁"
      />

      {/* CustomAlert para notificaciones */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
        primaryButton={{
          text: "OK",
          onPress: hideAlert,
        }}
      />
    </View>
  );
};
