export interface Resource {
  id: string;
  resource_name: string;
  resource_desc: string;
  resource_img: string;
  resource_price: number; // Precio en USD
  resource_quanity: number; // Stock disponible
  resource_discount: number; // Descuento en porcentaje
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceCategory {
  id: string;
  category_name: string;
  category_desc: string;
  category_img?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourcesResponse {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponse {
  categories: ResourceCategory[];
}

// Para filtros y paginación
export interface ResourceFilters {
  category_id?: string;
  page?: number;
  limit?: number;
  search?: string;
}
