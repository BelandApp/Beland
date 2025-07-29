import { useState } from "react";
import { Reward } from "../types";
import { formatUSDPrice } from "../../../constants";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";

export const useUserBalance = () => {
  const { balance, getBeCoinsInUSD, redeemReward } = useBeCoinsStore();
  const [userBalance, setUserBalance] = useState(getBeCoinsInUSD()); // Balance inicial en USD equivalente

  const canAffordReward = (reward: Reward) => {
    return balance >= reward.cost; // reward.cost ahora está en BeCoins
  };

  const spendCoins = (
    rewardCost: number,
    rewardName: string,
    rewardId: string
  ) => {
    const success = redeemReward(rewardCost, rewardName, rewardId);
    if (success) {
      setUserBalance(getBeCoinsInUSD()); // Actualizar balance local
    }
    return success;
  };

  const addCoins = (amount: number) => {
    // Esta función ya no es necesaria, los BeCoins se manejan en el store
    setUserBalance(getBeCoinsInUSD());
  };

  const formatBalance = (balanceAmount: number = balance) => {
    return balance.toString(); // Mostrar BeCoins como número entero
  };

  return {
    userBalance: balance, // Balance en BeCoins
    userBalanceUSD: getBeCoinsInUSD(), // Balance en USD
    setUserBalance,
    canAffordReward,
    spendCoins,
    addCoins,
    formatBalance,
  };
};
