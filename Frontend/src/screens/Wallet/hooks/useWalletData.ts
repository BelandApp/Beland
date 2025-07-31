import { WalletData } from "../types";
import { formatUSDPrice } from "../../../constants";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";

export const useWalletData = () => {
  const { balance, getBeCoinsInUSD } = useBeCoinsStore();

  const walletData: WalletData = {
    balance: balance, // Usar balance real del store
    estimatedValue: formatUSDPrice(getBeCoinsInUSD()), // Valor real en USD
  };

  return {
    walletData,
  };
};
