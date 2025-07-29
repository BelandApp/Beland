import { WalletData, FRSData } from "../types";
import { formatUSDPrice, convertPesoToUSD } from "../../../constants";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";

export const useWalletData = () => {
  const { balance, getBeCoinsInUSD } = useBeCoinsStore();

  const walletData: WalletData = {
    balance: balance, // Usar balance real del store
    estimatedValue: formatUSDPrice(getBeCoinsInUSD()), // Valor real en USD
  };

  const frsData: FRSData = {
    title: "FRS",
    rating: "★★★★★",
    amount: formatUSDPrice(convertPesoToUSD(1000)), // ~$2.86
    rate: formatUSDPrice(convertPesoToUSD(6500)), // ~$18.57
    details: "1.2367 USD",
  };

  return {
    walletData,
    frsData,
  };
};
