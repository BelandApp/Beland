import { apiRequest } from "./api";
import {
  Resource,
  ResourceCategory,
  ResourcesResponse,
  CategoriesResponse,
  ResourceFilters,
} from "../types/resource";

class ResourceService {
  /**
   * Obtener todos los recursos con filtros y paginación
   */
  async getResources(
    filters: ResourceFilters = {}
  ): Promise<ResourcesResponse> {
    const params = new URLSearchParams();

    if (filters.category_id) {
      params.append("categoria_id", filters.category_id);
    }
    if (filters.page) {
      params.append("page", filters.page.toString());
    }
    if (filters.limit) {
      params.append("limit", filters.limit.toString());
    }
    if (filters.search) {
      params.append("search", filters.search);
    }

    const queryString = params.toString();
    const url = queryString
      ? `/api/resources?${queryString}`
      : "/api/resources";

    console.log("[ResourceService] Fetching resources:", url);

    const response = await apiRequest(url, {
      method: "GET",
    });

    console.log("[ResourceService] Resources response:", response);
    return response;
  }

  /**
   * Obtener todas las categorías de recursos
   */
  async getCategories(): Promise<CategoriesResponse> {
    console.log("[ResourceService] Fetching categories");

    const response = await apiRequest("/api/category", {
      method: "GET",
    });

    console.log("[ResourceService] Categories response:", response);
    return response;
  }

  /**
   * Obtener un recurso específico por ID
   */
  async getResourceById(id: string): Promise<Resource> {
    console.log("[ResourceService] Fetching resource by ID:", id);

    const response = await apiRequest(`/api/resources/${id}`, {
      method: "GET",
    });

    console.log("[ResourceService] Resource detail response:", response);
    return response;
  }

  /**
   * Buscar recursos por texto
   */
  async searchResources(
    query: string,
    filters: Omit<ResourceFilters, "search"> = {}
  ): Promise<ResourcesResponse> {
    return this.getResources({ ...filters, search: query });
  }
}

export const resourceService = new ResourceService();
