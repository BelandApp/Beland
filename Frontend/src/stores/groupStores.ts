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

// Store para administración de productos de grupo
interface GroupAdminStore {
  productsByGroup: { [groupId: string]: GroupProduct[] };
  setGroupProducts: (groupId: string, products: GroupProduct[]) => void;
  addProductToGroup: (groupId: string, product: GroupProduct) => void;
  increaseGroupProductQuantity: (groupId: string, productName: string) => void;
  clearGroupProducts: (groupId: string) => void;
}

export const useGroupAdminStore = create<GroupAdminStore>((set, get) => ({
  productsByGroup: {},
  setGroupProducts: (groupId, products) => {
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
  increaseGroupProductQuantity: (groupId, productName) => {
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
  clearGroupProducts: (groupId) => {
    set({
      productsByGroup: {
        ...get().productsByGroup,
        [groupId]: [],
      },
    });
  },
}));
