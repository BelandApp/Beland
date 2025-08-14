// import { apiRequest } from "./api";

import Constants from "expo-constants";

// export interface User {
//   id: string;
//   email: string;
//   full_name: string | null;
//   profile_picture_url: string | null;
//   role_name: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface CreateUserRequest {
//   email: string;
//   oauth_provider?: string;
//   username?: string;
//   full_name?: string;
//   profile_picture_url?: string;
//   role?: string;
//   password: string;
//   confirmPassword: string;
//   address: string;
//   phone: number;
//   country: string;
//   city: string;
//   isBlocked: boolean;
// }

// class UserService {
//   // Cache para evitar múltiples llamadas con el mismo email
//   private userCache = new Map<string, { user: User; timestamp: number }>();
//   private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

//   // Función helper para obtener usuario por email o crearlo si no existe
//   async resolveUserByEmail(email: string): Promise<User> {
//     // Verificar cache
//     const cached = this.userCache.get(email);
//     if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
//       return cached.user;
//     }

//     try {
//       const user = await apiRequest(
//         `/users/by-email?email=${encodeURIComponent(email)}`,
//         {
//           method: "GET",
//         }
//       );

//       // Guardar en cache
//       this.userCache.set(email, { user, timestamp: Date.now() });
//       return user;
//     } catch (error: any) {
//       // Si el error es 401/403 (no autorizado), no intentar crear usuario, solo propagar el error
//       if (
//         error?.message?.includes("No autorizado") ||
//         error?.message?.includes("Unauthorized") ||
//         error?.status === 401 ||
//         error?.status === 403
//       ) {
//         throw error;
//       }
//       // Si no existe, intentar crear el usuario con datos por defecto para Auth0
//       try {
//         const defaultPassword = "TempPass123!"; // Password temporal para usuarios de Auth0
//         const newUser = await apiRequest("/users", {
//           method: "POST",
//           body: JSON.stringify({
//             email: email,
//             oauth_provider: "google", // Asumir Google OAuth por defecto
//             username: email.split("@")[0],
//             full_name: email.split("@")[0],
//             profile_picture_url: null,
//             role: "USER",
//             password: defaultPassword,
//             confirmPassword: defaultPassword,
//             address: "Dirección no especificada",
//             phone: 1234567890, // Número temporal
//             country: "No especificado",
//             city: "No especificada",
//             isBlocked: false,
//           }),
//         });

//         // Guardar en cache
//         this.userCache.set(email, { user: newUser, timestamp: Date.now() });
//         return newUser;
//       } catch (createError) {
//         throw createError;
//       }
//     }
//   }

//   // Obtener UUID del usuario por email
//   async getUserUUIDByEmail(email: string): Promise<string> {
//     const user = await this.resolveUserByEmail(email);
//     return user.id;
//   }

//   // Obtener email del usuario por UUID (método auxiliar)
//   async getUserEmailByUUID(uuid: string): Promise<string> {
//     const user = await this.getUserById(uuid);
//     return user.email;
//   }

//   // Limpiar cache
//   clearCache(): void {
//     this.userCache.clear();
//   }

//   // Obtener usuario por ID
//   async getUserById(id: string): Promise<User> {
//     try {
//       const response = await apiRequest(`/users/${id}`, {
//         method: "GET",
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // Crear usuario
//   async createUser(userData: CreateUserRequest): Promise<User> {
//     try {
//       const response = await apiRequest("/users", {
//         method: "POST",
//         body: JSON.stringify(userData),
//       });
//       return response;
//     } catch (error) {
//       throw error;
//     }
//   }
// }

// export const userService = new UserService();

// services/auth.service.ts

const API_URL =Constants.expoConfig?.extra?.apiUrl as string || "http://localhost:8081"; // Asegúrate de que esta URL apunte a tu backend

export const fetchCurrentUser = async (token: string) => {
  try {
    const response = await fetch(`${API_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Manejar errores de la respuesta HTTP
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data; // Esto debería ser el objeto UserDto
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    return null;
  }
};