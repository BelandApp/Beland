import { create } from "zustand";

export interface GroupProduct {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  totalPrice: number;
  category: string;
  basePrice: number;
  image: string;
}

interface CreateGroupStore {
  products: GroupProduct[];
  addProduct: (product: GroupProduct) => void;
  increaseQuantity: (productName: string) => void;
  clearGroup: () => void;
}

export const useCreateGroupStore = create<CreateGroupStore>((set, get) => ({
  products: [],
  addProduct: (product) => {
    const existing = get().products.find((p) => p.name === product.name);
    if (existing) {
      set({
        products: get().products.map((p) =>
          p.name === product.name ? { ...p, quantity: p.quantity + 1 } : p
        ),
      });
    } else {
      set({ products: [...get().products, product] });
    }
  },
  increaseQuantity: (productName) => {
    set({
      products: get().products.map((p) =>
        p.name === productName ? { ...p, quantity: p.quantity + 1 } : p
      ),
    });
  },
  clearGroup: () => set({ products: [] }),
}));

// Store para grupos ya creados
interface ExistingGroupStore {
  productsByGroup: { [groupId: string]: GroupProduct[] };
  setProducts: (groupId: string, products: GroupProduct[]) => void;
  addProductToGroup: (groupId: string, product: GroupProduct) => void;
  increaseProductQuantity: (groupId: string, productName: string) => void;
  clearProducts: (groupId: string) => void;
}

export const useExistingGroupStore = create<ExistingGroupStore>((set, get) => ({
  productsByGroup: {},
  setProducts: (groupId, products) => {
    set({
      productsByGroup: {
        ...get().productsByGroup,
        [groupId]: products,
      },
    });
  },
  addProductToGroup: (groupId, product) => {
    const products = get().productsByGroup[groupId] || [];
    const existing = products.find((p) => p.name === product.name);
    let updatedProducts;
    if (existing) {
      updatedProducts = products.map((p) =>
        p.name === product.name ? { ...p, quantity: p.quantity + 1 } : p
      );
    } else {
      updatedProducts = [...products, product];
    }
    set({
      productsByGroup: {
        ...get().productsByGroup,
        [groupId]: updatedProducts,
      },
    });
  },
  increaseProductQuantity: (groupId, productName) => {
    const products = get().productsByGroup[groupId] || [];
    set({
      productsByGroup: {
        ...get().productsByGroup,
        [groupId]: products.map((p) =>
          p.name === productName ? { ...p, quantity: p.quantity + 1 } : p
        ),
      },
    });
  },
  clearProducts: (groupId) => {
    set({
      productsByGroup: {
        ...get().productsByGroup,
        [groupId]: [],
      },
    });
  },
}));
