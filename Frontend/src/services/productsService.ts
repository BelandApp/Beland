import { apiRequest } from "./api";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  created_at: string;
  deleted_at: string | null;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
  category?: string;
  name?: string;
}

export const productsService = {
  async getProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.category) params.append("category", query.category);
    if (query.name) params.append("name", query.name);
    const url = `/products?${params.toString()}`;
    return await apiRequest(url, { method: "GET" });
  },
};
