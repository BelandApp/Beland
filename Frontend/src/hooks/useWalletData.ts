import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { useBeCoinsStore } from "../stores/useBeCoinsStore";
import { walletService, Wallet } from "../services/walletService";
import { convertBackendBalance } from "../utils/balanceConverter";

interface UseWalletDataReturn {
  walletData: Wallet | null;
  balance: number;
  balanceUSD: number;
  isLoading: boolean;
  error: string | null;
  refreshWallet: () => Promise<void>;
}

export const useWalletData = (): UseWalletDataReturn => {
  const { user } = useAuth();
  const { setBalance, getBeCoinsInUSD } = useBeCoinsStore();

  const [walletData, setWalletData] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    if (!user?.email) {
      setError("Usuario no autenticado");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Usar backend real siempre
      const wallet = await walletService.getWalletByUserId(user.email);

      setWalletData(wallet);
      // Convertir el balance usando la utilidad que maneja tanto enteros como decimales
      const actualBalance = convertBackendBalance(wallet.becoin_balance || 0);
      // Sincronizar el balance del backend con el store local
      setBalance(actualBalance);
      console.log("💰 Balance real del backend sincronizado:", actualBalance);
    } catch (err) {
      console.error("Error al cargar datos de wallet:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      // No usar fallback, mostrar el error real
      setWalletData(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email, setBalance]);

  const refreshWallet = useCallback(async () => {
    await fetchWalletData();
  }, [fetchWalletData]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  // Calcular el balance convertido y en USD
  const convertedBalance = convertBackendBalance(
    walletData?.becoin_balance || 0
  );
  const balanceUSD = getBeCoinsInUSD(convertedBalance);

  return {
    walletData,
    balance: convertedBalance,
    balanceUSD,
    isLoading,
    error,
    refreshWallet,
  };
};
