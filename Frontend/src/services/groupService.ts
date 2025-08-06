import { Group, Participant, Product, PaymentMode } from "../types";
import { APP_CONFIG } from "../constants";
import { generateId, calculateBeCoins } from "../utils/validation";
import { groupStorage } from "./groupStorage";
import { MOCK_GROUPS } from "../data/mockData";
import { CURRENT_USER_ID } from "../data/user";

export interface CreateGroupData {
  name: string;
  type: string;
  description: string;
  location: string;
  deliveryTime: string;
  participants: Participant[];
  products: Product[];
  paymentMode?: PaymentMode;
  payingUserId?: string;
}

export class GroupService {
  static async createGroup(data: CreateGroupData): Promise<Group> {
    // Simular delay de red
    await new Promise((resolve) =>
      setTimeout(resolve, APP_CONFIG.NETWORK_DELAY)
    );

    const totalAmount = this.calculateTotalAmount(data.products);
    const totalParticipants = data.participants.length + 1; // +1 for creator
    const costPerPerson = totalAmount / totalParticipants;

    const newGroup: Group = {
      id: generateId(),
      name: data.name.trim(),
      type: data.type.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      deliveryTime: data.deliveryTime.trim(),
      participantsList: [
        {
          id: "creator",
          name: "Tú (Creador)",
          instagramUsername: "mi_usuario",
        },
        ...data.participants,
      ],
      participants: totalParticipants,
      products: data.products.map((p) => ({
        ...p,
        totalPrice: p.estimatedPrice * p.quantity,
      })),
      totalParticipants,
      totalAmount,
      myConsumption: Math.round(costPerPerson),
      costPerPerson,
      status: "active",
      beCoinsGenerated: calculateBeCoins(
        totalAmount,
        APP_CONFIG.BECOINS_PERCENTAGE
      ),
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_USER_ID,
      paymentMode: data.paymentMode || "equal_split",
      payingUserId: data.payingUserId,
    };

    groupStorage.addGroup(newGroup);
    return newGroup;
  }

  static calculateTotalAmount(products: Product[]): number {
    return products.reduce(
      (total, product) => total + product.estimatedPrice * product.quantity,
      0
    );
  }

  static calculateCostPerPerson(
    totalAmount: number,
    participantCount: number
  ): number {
    return participantCount > 0 ? totalAmount / participantCount : 0;
  }

  static getAllGroups(): Group[] {
    return this.getAllCombinedGroups();
  }

  // Método privado para obtener grupos combinados (mockeados + storage)
  private static getAllCombinedGroups(): Group[] {
    const storageGroups = groupStorage.getAllGroups();
    const storageIds = new Set(storageGroups.map((group) => group.id));

    // Solo incluir grupos mockeados que no estén ya en el storage
    const uniqueMockGroups = MOCK_GROUPS.filter(
      (group) => !storageIds.has(group.id)
    );

    return [...uniqueMockGroups, ...storageGroups];
  }

  // Método privado para obtener grupo por ID incluyendo mockeados
  private static getGroupByIdCombined(id: string): Group | undefined {
    const allGroups = this.getAllCombinedGroups();
    return allGroups.find((group) => group.id === id);
  }

  static getActiveGroups(): Group[] {
    const allGroups = this.getAllCombinedGroups();
    return allGroups.filter(
      (group) => group.status === "active" || group.status === "pending_payment"
    );
  }

  static getCompletedGroups(): Group[] {
    const allGroups = this.getAllCombinedGroups();
    return allGroups.filter((group) => group.status === "completed");
  }

  // Método privado para asegurar que un grupo está en el storage antes de editarlo
  private static ensureGroupInStorage(groupId: string): Group | null {
    let group = groupStorage.getGroupById(groupId);

    // Si no está en storage, buscar en grupos combinados
    if (!group) {
      const combinedGroup = this.getGroupByIdCombined(groupId);
      if (combinedGroup) {
        console.log(
          `Copiando grupo mockeado "${combinedGroup.name}" (ID: ${combinedGroup.id}) al storage`
        );
        // Copiar el grupo mockeado al storage
        groupStorage.addGroup(combinedGroup);
        group = combinedGroup;
      }
    }

    return group || null;
  }

  // Gestión de participantes
  static async addParticipantToGroup(
    groupId: string,
    participant: Participant
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const updatedParticipantsList = [...group.participantsList, participant];
    const newTotalParticipants = group.totalParticipants + 1;

    const updates: Partial<Group> = {
      participantsList: updatedParticipantsList,
      totalParticipants: newTotalParticipants,
    };

    // Recalcular costos según el modo de pago
    this.calculateCostsForUpdates(group, updates);

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  static async removeParticipantFromGroup(
    groupId: string,
    participantId: string
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const updatedParticipantsList = group.participantsList.filter(
      (p) => p.id !== participantId
    );
    const newTotalParticipants = group.totalParticipants - 1;

    const updates: Partial<Group> = {
      participantsList: updatedParticipantsList,
      totalParticipants: newTotalParticipants,
    };

    // Recalcular costos según el modo de pago
    this.calculateCostsForUpdates(group, updates);

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  // Gestión de productos
  static async addProductToGroup(
    groupId: string,
    product: Product
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const productWithTotal = {
      ...product,
      totalPrice: product.estimatedPrice * product.quantity,
    };

    const updates: Partial<Group> = {
      products: [...group.products, productWithTotal],
    };

    // Recalcular costos
    this.calculateCostsForUpdates(group, updates);

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  static async removeProductFromGroup(
    groupId: string,
    productId: string
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const updates: Partial<Group> = {
      products: group.products.filter((p) => p.id !== productId),
    };

    // Recalcular costos
    this.calculateCostsForUpdates(group, updates);

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  static async updateProductQuantity(
    groupId: string,
    productId: string,
    newQuantity: number
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const updates: Partial<Group> = {
      products: group.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              quantity: newQuantity,
              totalPrice: p.estimatedPrice * newQuantity,
            }
          : p
      ),
    };

    // Recalcular costos
    this.calculateCostsForUpdates(group, updates);

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  // Gestión de modos de pago
  static async updatePaymentMode(
    groupId: string,
    paymentMode: PaymentMode,
    payingUserId?: string
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const updates: Partial<Group> = {
      paymentMode,
      payingUserId: paymentMode === "single_payer" ? payingUserId : undefined,
    };

    // Recalcular costos según el nuevo modo de pago
    this.calculateCostsForUpdates(group, updates);

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  static async updateParticipantCustomAmount(
    groupId: string,
    participantId: string,
    customAmount: number
  ): Promise<Group | null> {
    const group = this.ensureGroupInStorage(groupId);
    if (!group) return null;

    const updates: Partial<Group> = {
      participantsList: group.participantsList.map((p) =>
        p.id === participantId ? { ...p, customAmount } : p
      ),
    };

    groupStorage.updateGroup(groupId, updates);
    return { ...group, ...updates };
  }

  // Método auxiliar para recalcular costos
  private static calculateCostsForUpdates(
    originalGroup: Group,
    updates: Partial<Group>
  ): void {
    const tempGroup = { ...originalGroup, ...updates };
    const totalAmount = this.calculateTotalAmount(
      tempGroup.products || originalGroup.products
    );

    updates.totalAmount = totalAmount;

    const paymentMode = tempGroup.paymentMode || originalGroup.paymentMode;
    const totalParticipants =
      tempGroup.totalParticipants || originalGroup.totalParticipants;

    switch (paymentMode) {
      case "equal_split":
        updates.costPerPerson = this.calculateCostPerPerson(
          totalAmount,
          totalParticipants
        );
        updates.myConsumption = Math.round(updates.costPerPerson);
        break;

      case "single_payer":
        updates.costPerPerson = 0; // Solo paga uno
        updates.myConsumption =
          tempGroup.payingUserId === "current_user_id" ? totalAmount : 0;
        break;

      case "custom_amounts":
        const participantsList =
          tempGroup.participantsList || originalGroup.participantsList;
        const customTotal = participantsList.reduce(
          (sum, p) => sum + (p.customAmount || 0),
          0
        );
        updates.costPerPerson = customTotal / totalParticipants;
        const currentUser = participantsList.find(
          (p) => p.id === "current_user_id"
        );
        updates.myConsumption = currentUser?.customAmount || 0;
        break;
    }

    // Recalcular BeCoins
    updates.beCoinsGenerated = calculateBeCoins(
      totalAmount,
      APP_CONFIG.BECOINS_PERCENTAGE
    );
  }
}
