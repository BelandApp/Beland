
import { apiRequest } from "./api";
import {
  Group,
  GroupsResponse,
  GroupQuery,
  CreateGroupDto,
  UpdateGroupDto,
  AddGroupMemberDto,
} from "../types/Group"; 

export const groupsApi = {
  async getGroups(query: GroupQuery = {}): Promise<GroupsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.name) params.append("name", query.name);
    if (query.location) params.append("location", query.location);
    if (query.status) params.append("status", query.status);
    const url = `/groups?${params.toString()}`;
    return await apiRequest(url, { method: "GET" });
  },

  async getGroupById(id: string): Promise<Group> {
    const url = `/groups/${id}`;
    return await apiRequest(url, { method: "GET" });
  },

  async createGroup(dto: CreateGroupDto): Promise<Group> {
    const url = `/groups`;
    return await apiRequest(url, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  async updateGroup(id: string, dto: UpdateGroupDto): Promise<Group> {
    const url = `/groups/${id}`;
    return await apiRequest(url, {
      method: "PATCH",
      body: JSON.stringify(dto),
    });
  },

  async deleteGroup(id: string): Promise<void> {
    const url = `/groups/${id}`;
    await apiRequest(url, {
      method: "DELETE",
    });
  },

  async addGroupMember(groupId: string, dto: AddGroupMemberDto): Promise<void> {
    const url = `/groups/${groupId}/members`;
    await apiRequest(url, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  },

  async removeGroupMember(groupId: string, memberId: string): Promise<void> {
    const url = `/groups/${groupId}/members/${memberId}`;
    await apiRequest(url, {
      method: "DELETE",
    });
  },
};
