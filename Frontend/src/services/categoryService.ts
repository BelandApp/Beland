import { apiRequest } from "./api";

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const categoryService = {
  async getCategories(page = 1, limit = 100): Promise<Category[]> {
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", String(limit));
    const url = `/category?${params.toString()}`;
    const [categories] = await apiRequest(url, { method: "GET" });
    return categories || [];
  },
};
