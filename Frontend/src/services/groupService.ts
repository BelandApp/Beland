import { Group, Participant, Product, PaymentMode } from "../types";
import { APP_CONFIG } from "../constants";
import { generateId, calculateBeCoins } from "../utils/validation";
import { groupStorage } from "./groupStorage";
import { MOCK_GROUPS } from "../data/mockData";
import { CURRENT_USER_ID } from "../data/user";

// ✅ Importación de los servicios y tipos correctos
import { groupsApi } from "./groupApis";
import {
  Group as ApiGroup,
  GroupsResponse,
  CreateGroupDto,
  UpdateGroupDto,
  AddGroupMemberDto,
} from "../types/Group";

export interface CreateGroupData {
  name: string;
  type: string;
  description: string;
  location: string;
  deliveryTime: string;
  participants: Participant[];
  products?: Product[];
  paymentMode?: PaymentMode;
  payingUserId?: string;
}

export class GroupService {
  // ✅ Métodos para la API
  static async getGroupsFromApi(): Promise<GroupsResponse> {
    return groupsApi.getGroups();
  }

  static async getGroupByIdFromApi(id: string): Promise<ApiGroup> {
    return groupsApi.getGroupById(id);
  }

  static async createGroupApi(dto: CreateGroupDto): Promise<ApiGroup> {
    return groupsApi.createGroup(dto);
  }

  static async updateGroupApi(
    id: string,
    dto: UpdateGroupDto
  ): Promise<ApiGroup> {
    return groupsApi.updateGroup(id, dto);
  }

  static async deleteGroupApi(id: string): Promise<void> {
    return groupsApi.deleteGroup(id);
  }

  static async addGroupMemberApi(
    groupId: string,
    dto: AddGroupMemberDto
  ): Promise<void> {
    return groupsApi.addGroupMember(groupId, dto);
  }

  static async removeGroupMemberApi(
    groupId: string,
    memberId: string
  ): Promise<void> {
    return groupsApi.removeGroupMember(groupId, memberId);
  }

  // ----------------------
  // Métodos con datos de prueba (los que ya tenías)
  // ----------------------
  static async createGroup(data: CreateGroupData): Promise<Group> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.NETWORK_DELAY));

    const products = data.products || [];
    const totalAmount = this.calculateTotalAmount(products);
    const totalParticipants = data.participants.length + 1; // +1 for creator
    const costPerPerson =
      totalParticipants > 0 ? totalAmount / totalParticipants : 0;

    const newGroup: Group = {
      id: generateId(),
      name: data.name.trim(),
      type: data.type.trim(),
      description: data.description.trim(),
      location: data.location.trim(),
      deliveryTime: data.deliveryTime.trim(),
      leader: "current_user_id",
      products,
      participants: [
        ...data.participants,
        { id: "current_user_id", name: "Tú", consumption: totalAmount },
      ],
      totalAmount,
      costPerPerson: costPerPerson,
      beCoinsEarned: calculateBeCoins(totalAmount),
      myConsumption: totalAmount,
      status: "pending",
    };

    // ✅ La llamada corregida a groupStorage
    await groupStorage.addGroup(newGroup);

    return newGroup;
  }

  static async getGroups(): Promise<Group[]> {
    // ✅ Se utiliza el método getAllGroups() que devuelve directamente el array
    const storedGroups = groupStorage.getAllGroups();
    const allGroups =
      storedGroups && storedGroups.length > 0 ? storedGroups : MOCK_GROUPS;
    return allGroups.map(group => {
      const myConsumption =
        group.participants.find(p => p.id === CURRENT_USER_ID)?.consumption ||
        0;
      return {
        ...group,
        myConsumption: myConsumption,
      };
    });
  }

  static async getGroup(groupId: string): Promise<Group | undefined> {
    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.NETWORK_DELAY));
    // ✅ Se utiliza getGroupById() que ya se encarga de la lógica
    return groupStorage.getGroupById(groupId);
  }

  static async updateGroup(
    groupId: string,
    updates: Partial<Group>
  ): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.NETWORK_DELAY));
    await groupStorage.updateGroup(groupId, updates);
  }

  static calculateTotalAmount(products: Product[]): number {
    return products.reduce((sum, product) => sum + product.price, 0);
  }

  static calculateCostPerPerson(
    totalAmount: number,
    totalParticipants: number
  ): number {
    return totalParticipants > 0 ? totalAmount / totalParticipants : 0;
  }
}
