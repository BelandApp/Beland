import { create } from "zustand";
// Eliminada la persistencia del formulario de creación de grupo
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

  // Acciones de control
  setIsCreatingGroup: (isCreating: boolean) =>
    set({ isCreatingGroup: isCreating }),

  clearGroup: () => set(initialState),
  resetToInitialState: () => set(initialState),
}));

// Ya no se hidrata el store de creación de grupo porque no se persiste
