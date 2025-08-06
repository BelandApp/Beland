import { create } from "zustand";
// Eliminada la persistencia del formulario de creación de grupo
import { useEffect, useState } from "react";
import { Product, Participant } from "../types";

interface CreateGroupState {
  consumo: "mucho" | "poco" | "normal";
  setConsumo: (consumo: "mucho" | "poco" | "normal") => void;
  // Datos del grupo
  groupName: string;
  groupType: string;
  description: string;
  location: string;
  deliveryTime: string;
  participants: Participant[];
  products: Product[];

  // Estados auxiliares
  isCreatingGroup: boolean;

  // Acciones para el grupo
  setGroupName: (name: string) => void;
  setGroupType: (type: string) => void;
  setDescription: (description: string) => void;
  setLocation: (location: string) => void;
  setDeliveryTime: (time: string) => void;

  // Acciones para participantes
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  updateParticipant: (id: string, participant: Partial<Participant>) => void;

  // Acciones para productos
  addProduct: (product: Product) => void;
  removeProduct: (id: string) => void;
  updateProductQuantity: (id: string, quantity: number) => void;

  // Acciones de control
  setIsCreatingGroup: (isCreating: boolean) => void;
  clearGroup: () => void;
  resetToInitialState: () => void;
}

const initialState = {
  groupName: "",
  groupType: "",
  description: "",
  location: "",
  deliveryTime: "",
  participants: [],
  products: [],
  isCreatingGroup: false,
  consumo: "normal" as "mucho" | "poco" | "normal",
};

export const useCreateGroupStore = create<CreateGroupState>((set, get) => ({
  ...initialState,

  setConsumo: (consumo) => {
    set({ consumo });
  },

  // Acciones para el grupo
  setGroupName: (name: string) => set({ groupName: name }),
  setGroupType: (type: string) => set({ groupType: type }),
  setDescription: (description: string) => set({ description }),
  setLocation: (location: string) => set({ location }),
  setDeliveryTime: (time: string) => set({ deliveryTime: time }),

  // Acciones para participantes
  addParticipant: (participant: Participant) =>
    set((state) => ({ participants: [...state.participants, participant] })),
  removeParticipant: (id: string) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    })),
  updateParticipant: (id: string, participantUpdate: Partial<Participant>) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...participantUpdate } : p
      ),
    })),

  // Acciones para productos
  addProduct: (product: Product) =>
    set((state) => {
      const existingProductIndex = state.products.findIndex(
        (p) => p.id === product.id
      );
      let updatedProducts;
      if (existingProductIndex >= 0) {
        updatedProducts = [...state.products];
        updatedProducts[existingProductIndex] = {
          ...updatedProducts[existingProductIndex],
          quantity:
            updatedProducts[existingProductIndex].quantity + product.quantity,
          totalPrice:
            (updatedProducts[existingProductIndex].quantity +
              product.quantity) *
            (updatedProducts[existingProductIndex].estimatedPrice || 0),
        };
      } else {
        updatedProducts = [...state.products, product];
      }
      return { products: updatedProducts };
    }),
  removeProduct: (id: string) =>
    set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
  updateProductQuantity: (id: string, quantity: number) =>
    set((state) => {
      let updatedProducts;
      if (quantity <= 0) {
        updatedProducts = state.products.filter((p) => p.id !== id);
      } else {
        updatedProducts = state.products.map((p) =>
          p.id === id
            ? { ...p, quantity, totalPrice: quantity * (p.estimatedPrice || 0) }
            : p
        );
      }
      return { products: updatedProducts };
    }),

  // Acciones de control
  setIsCreatingGroup: (isCreating: boolean) =>
    set({ isCreatingGroup: isCreating }),

  clearGroup: () => set(initialState),
  resetToInitialState: () => set(initialState),
}));

// Ya no se hidrata el store de creación de grupo porque no se persiste
