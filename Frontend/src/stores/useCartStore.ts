import { create } from "zustand";

// Import dinámico de AsyncStorage solo en mobile
let AsyncStorage: any = undefined;
if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch {}
}

function isWeb() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

const STORAGE_KEY = "cart-store";

function saveCartState(state: Partial<CartState>) {
  const data = JSON.stringify(state);
  if (isWeb()) {
    window.localStorage.setItem(STORAGE_KEY, data);
  } else if (AsyncStorage) {
    AsyncStorage.setItem(STORAGE_KEY, data);
  }
}

async function loadCartState(): Promise<Partial<CartState> | null> {
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

export type CartProduct = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CartState = {
  products: CartProduct[];
  deliveryType?: "group" | "home";
  groupId?: string;
  address?: string;
  addProduct: (product: CartProduct) => void;
  removeProduct: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setDeliveryType: (
    type: "group" | "home",
    groupId?: string,
    address?: string
  ) => void;
  hydrate: () => Promise<void>;
};

const initialCartState: Omit<
  CartState,
  | "addProduct"
  | "removeProduct"
  | "updateQuantity"
  | "clearCart"
  | "setDeliveryType"
  | "hydrate"
> = {
  products: [],
  deliveryType: undefined,
  groupId: undefined,
  address: undefined,
};

export const useCartStore = create<CartState>((set, get) => ({
  ...initialCartState,
  addProduct: (product) =>
    set((state) => {
      const existing = state.products.find((p) => p.id === product.id);
      let newProducts;
      if (existing) {
        newProducts = state.products.map((p) =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        );
      } else {
        newProducts = [...state.products, product];
      }
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      return newState;
    }),
  removeProduct: (productId) =>
    set((state) => {
      const newProducts = state.products.filter((p) => p.id !== productId);
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      return newState;
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const newProducts = state.products.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      );
      const newState = { ...state, products: newProducts };
      saveCartState(newState);
      return newState;
    }),
  clearCart: () => {
    const newState = { ...initialCartState };
    saveCartState(newState);
    set(newState);
  },
  setDeliveryType: (type, groupId, address) => {
    const newState = { ...get(), deliveryType: type, groupId, address };
    saveCartState(newState);
    set(newState);
  },
  hydrate: async () => {
    const loaded = await loadCartState();
    if (loaded && loaded.products) {
      set((state) => ({ ...state, ...loaded }));
    }
  },
}));
