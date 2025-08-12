import { create } from "zustand";

// Import dinámico de AsyncStorage solo en mobile
let AsyncStorage: any = undefined;
if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch {}
}

import { useEffect } from "react";

// Helpers de persistencia multiplataforma
const STORAGE_KEY = "becoins-store";

function isWeb() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function saveState(state: Partial<BeCoinsState>) {
  const data = JSON.stringify(state);
  if (isWeb()) {
    window.localStorage.setItem(STORAGE_KEY, data);
  } else if (AsyncStorage) {
    AsyncStorage.setItem(STORAGE_KEY, data);
  }
}

async function loadState(): Promise<Partial<BeCoinsState> | null> {
  try {
    if (isWeb()) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } else if (AsyncStorage) {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch {
    return null;
  }
}

// Constantes para BeCoins
export const BECOIN_VALUE_USD = 0.05; // 5 centavos de dólar por BeCoin
export const INITIAL_BECOIN_BALANCE = 300; // Balance inicial para usuarios

interface BeCoinsState {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  transactions: BeCoinsTransaction[];
}

export interface BeCoinsTransaction {
  id: string;
  type: "earned" | "spent" | "refund";
  amount: number;
  description: string;
  category: "reward" | "catalog" | "group_payment" | "initial" | "bonus";
  timestamp: Date;
  relatedId?: string; // ID del grupo, producto o premio relacionado
}

interface BeCoinsActions {
  // Acciones de balance
  spendBeCoins: (
    amount: number,
    description: string,
    category: BeCoinsTransaction["category"],
    relatedId?: string
  ) => boolean;
  earnBeCoins: (
    amount: number,
    description: string,
    category: BeCoinsTransaction["category"],
    relatedId?: string
  ) => void;
  refundBeCoins: (
    amount: number,
    description: string,
    relatedId?: string
  ) => void;
  setBalance: (amount: number) => void;

  // Utilidades
  hasEnoughBeCoins: (amount: number) => boolean;
  getBeCoinsInUSD: (amount?: number) => number;
  getUSDInBeCoins: (usdAmount: number) => number;
  getTransactionHistory: () => BeCoinsTransaction[];

  // Reset (para testing)
  resetBalance: () => void;

  // Acciones específicas
  payWithBeCoins: (
    usdAmount: number,
    description: string,
    relatedId?: string
  ) => boolean;
  redeemReward: (
    beCoinsCost: number,
    rewardName: string,
    rewardId: string
  ) => boolean;
  purchaseWithBeCoins: (
    beCoinsCost: number,
    productName: string,
    productId: string
  ) => boolean;
}

type BeCoinsStore = BeCoinsState & BeCoinsActions;

const generateTransactionId = () => {
  return `becoin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initialState: BeCoinsState = {
  balance: 0, // Iniciar con 0, el backend proporcionará el balance real
  totalEarned: 0, // También iniciar con 0
  totalSpent: 0,
  transactions: [], // Sin transacciones iniciales, vendrán del backend
};

import { useState } from "react";
let hasLoaded = false;

export const useBeCoinsStore = create<BeCoinsStore>((set, get) => ({
  ...initialState,

  // Acciones principales
  spendBeCoins: (
    amount: number,
    description: string,
    category: BeCoinsTransaction["category"],
    relatedId?: string
  ) => {
    const state = get();

    if (amount <= 0) {
      console.warn("La cantidad a gastar debe ser mayor a 0");
      return false;
    }

    if (state.balance < amount) {
      console.warn(
        `Balance insuficiente. Balance actual: ${state.balance}, Intentando gastar: ${amount}`
      );
      return false;
    }

    const transaction: BeCoinsTransaction = {
      id: generateTransactionId(),
      type: "spent",
      amount,
      description,
      category,
      timestamp: new Date(),
      relatedId,
    };

    set((state) => {
      const newState = {
        balance: state.balance - amount,
        totalSpent: state.totalSpent + amount,
        transactions: [transaction, ...state.transactions],
      };
      saveState({ ...state, ...newState });
      return newState;
    });

    return true;
  },

  earnBeCoins: (
    amount: number,
    description: string,
    category: BeCoinsTransaction["category"],
    relatedId?: string
  ) => {
    if (amount <= 0) {
      console.warn("La cantidad a ganar debe ser mayor a 0");
      return;
    }

    const transaction: BeCoinsTransaction = {
      id: generateTransactionId(),
      type: "earned",
      amount,
      description,
      category,
      timestamp: new Date(),
      relatedId,
    };

    set((state) => {
      const newState = {
        balance: state.balance + amount,
        totalEarned: state.totalEarned + amount,
        transactions: [transaction, ...state.transactions],
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  refundBeCoins: (amount: number, description: string, relatedId?: string) => {
    if (amount <= 0) {
      console.warn("La cantidad a reembolsar debe ser mayor a 0");
      return;
    }

    const transaction: BeCoinsTransaction = {
      id: generateTransactionId(),
      type: "refund",
      amount,
      description,
      category: "group_payment",
      timestamp: new Date(),
      relatedId,
    };

    set((state) => {
      const newState = {
        balance: state.balance + amount,
        totalSpent: Math.max(0, state.totalSpent - amount),
        transactions: [transaction, ...state.transactions],
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  setBalance: (amount: number) => {
    if (amount < 0) {
      console.warn("El balance no puede ser negativo");
      return;
    }

    set((state) => {
      const newState = {
        balance: amount,
      };
      saveState({ ...state, ...newState });
      return newState;
    });
  },

  // Utilidades
  hasEnoughBeCoins: (amount: number) => {
    return get().balance >= amount;
  },

  getBeCoinsInUSD: (amount?: number) => {
    const beCoins = amount ?? get().balance;
    // Asegurar que siempre sea un número válido
    const validBeCoins =
      typeof beCoins === "number" && !isNaN(beCoins) ? beCoins : 0;
    return validBeCoins * BECOIN_VALUE_USD;
  },

  getUSDInBeCoins: (usdAmount: number) => {
    return Math.ceil(usdAmount / BECOIN_VALUE_USD);
  },

  getTransactionHistory: () => {
    return get().transactions;
  },

  resetBalance: () => {
    const resetState: BeCoinsState = {
      balance: 0, // Reset a 0, no usar balance inicial hardcodeado
      totalEarned: 0,
      totalSpent: 0,
      transactions: [],
    };
    set({ ...resetState });
    saveState(resetState);
  },

  // Acciones específicas
  payWithBeCoins: (
    usdAmount: number,
    description: string,
    relatedId?: string
  ) => {
    const beCoinsNeeded = get().getUSDInBeCoins(usdAmount);
    return get().spendBeCoins(
      beCoinsNeeded,
      `${description} (${usdAmount.toFixed(2)} USD)`,
      "group_payment",
      relatedId
    );
  },

  redeemReward: (beCoinsCost: number, rewardName: string, rewardId: string) => {
    return get().spendBeCoins(
      beCoinsCost,
      `Canje de premio: ${rewardName}`,
      "reward",
      rewardId
    );
  },

  purchaseWithBeCoins: (
    beCoinsCost: number,
    productName: string,
    productId: string
  ) => {
    return get().spendBeCoins(
      beCoinsCost,
      `Compra con BeCoins: ${productName}`,
      "catalog",
      productId
    );
  },
}));

// Hook para hidratar el store al iniciar y evitar sobrescribir el estado persistido
export function useBeCoinsStoreHydration() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (hasLoaded) return;
    hasLoaded = true;
    (async () => {
      const loaded = await loadState();
      if (loaded && loaded.transactions) {
        loaded.transactions = loaded.transactions.map((t: any) => ({
          ...t,
          timestamp: new Date(t.timestamp),
        }));
        useBeCoinsStore.setState((prev) => ({ ...prev, ...loaded }));
      }
      setIsLoaded(true);
    })();
  }, []);
  return isLoaded;
}
