import { apiRequest } from "./api";

// Tipos para las respuestas del API
export type User = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export type GoogleAuthRequest = {
  googleId: string;
  email: string;
  name?: string;
  picture?: string;
};

export type EmailAuthRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phone: number;
  country: string;
  city: string;
  username?: string;
  profile_picture_url?: string;
};

// Servicios de autenticación
export const authService = {
  // Login con Google
  loginWithGoogle: async (data: GoogleAuthRequest): Promise<User> => {
    return await apiRequest("/auth/google/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Registro con Google
  registerWithGoogle: async (data: GoogleAuthRequest): Promise<User> => {
    return await apiRequest("/auth/google/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Login con email y contraseña
  loginWithEmail: async (
    data: EmailAuthRequest
  ): Promise<{ token: string }> => {
    return await apiRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Registro con email y contraseña
  registerWithEmail: async (
    data: RegisterRequest
  ): Promise<{ token: string }> => {
    return await apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// Servicios de simulación para demo (sin backend)
export const demoAuthService = {
  // Simular login con Google
  loginWithGoogle: async (data: GoogleAuthRequest): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: `google_${data.googleId}`,
      email: data.email,
      name: data.name || "Usuario Google",
      picture: data.picture,
    };
  },

  // Simular registro con Google
  registerWithGoogle: async (data: GoogleAuthRequest): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      id: `google_${data.googleId}`,
      email: data.email,
      name: data.name || "Usuario Google",
      picture: data.picture,
    };
  },

  // Simular login con email
  loginWithEmail: async (data: EmailAuthRequest): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: `local_${Date.now()}`,
      email: data.email,
      name:
        data.email.split("@")[0].charAt(0).toUpperCase() +
        data.email.split("@")[0].slice(1),
      picture: undefined,
    };
  },

  // Simular registro con email
  registerWithEmail: async (
    data: RegisterRequest
  ): Promise<{ success: boolean }> => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { success: true };
  },
};
