import { Product } from "src/types/Products";
import { apiRequest } from "./api";

export interface CreateProductDto {
  name: string;
  description?: string;
  cost: number;
  price: number;
  image_url?: string;
  category_id?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  image_url?: string;
  category?: string;
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
  category_id?: string;
  name?: string;
}

export const productsService = {
  
  async getProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    if (query.page) params.append("page", String(query.page));
    if (query.limit) params.append("limit", String(query.limit));
    if (query.sortBy) params.append("sortBy", query.sortBy);
    if (query.order) params.append("order", query.order);
    if (query.category_id) params.append("category_id", query.category_id);
    if (query.name) params.append("name", query.name);
    const url = `/products?${params.toString()}`;
    return await apiRequest(url, { method: "GET" });
  },

 
  async getProductById(id: string): Promise<Product | null> {
    try {
      const url = `products/${id}`;
      const data = await apiRequest(url, { method: "GET" });
      return data as Product;
    } catch (error) {
      console.error(`Failed to fetch product with ID ${id}:`, error);
      return null;
    }
  },

  
  async createProduct(dto: CreateProductDto): Promise<Product> {
    const url = `products`;
    const data = await apiRequest(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return data as Product;
  },

 
  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const url = `products/${id}`;
    const data = await apiRequest(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });
    return data as Product;
  },

 
  async deleteProduct(id: string): Promise<void> {
    const url = `products/${id}`;
    await apiRequest(url, {
      method: "DELETE",
    });
  },

  
  async getRandomProducts(count: number = 5): Promise<Product[]> {
    try {
      const response = await this.getProducts({ limit: 100 });
      const allProducts = response.products;

      if (allProducts.length === 0 || count <= 0) {
        return [];
      }

      for (let i = allProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allProducts[i], allProducts[j]] = [allProducts[j], allProducts[i]];
      }

      return allProducts.slice(0, count);
    } catch (error) {
      console.error("Error fetching and shuffling products:", error);
      return [];
    }
  },
};
