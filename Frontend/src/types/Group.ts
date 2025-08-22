
// Tipo de los datos de un grupo
export interface Group {
  id: string;
  name: string;
  leader_id: string;
  location?: string | null;
  location_url?: string | null;
  date_time?: Date | null;
  status: "active" | "pending" | "inactive" | "delete" | "completed";
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// Tipo de la respuesta de la API al obtener varios grupos
export interface GroupsResponse {
  groups: Group[];
  total: number;
  page: number;
  limit: number;
}

// DTO para crear un grupo (basado en el backend)
export interface CreateGroupDto {
  name: string;
  location?: string | null;
  location_url?: string | null;
  date_time?: Date | null;
  group_type_id?: string;
  leader_id: string; // ✅ Asegúrate de tener este campo en el DTO de tu backend
}

// DTO para actualizar un grupo (basado en el backend)
export interface UpdateGroupDto {
  name?: string;
  location?: string | null;
  location_url?: string | null;
  date_time?: Date | null;
}

// DTO para añadir un miembro a un grupo (basado en el backend)
export interface AddGroupMemberDto {
  group_member_email: string;
}

// Tipos para las consultas a la API (filtros, paginación, etc.)
export interface GroupQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
  name?: string;
  location?: string;
  status?: string;
}
