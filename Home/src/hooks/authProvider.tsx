// src/providers/AuthProvider.tsx
"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";

// Define los tipos para tu contexto
interface UserData {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}

interface AuthContextType {
  user: UserData | null | undefined;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Tu AuthProvider que maneja el estado del usuario en el cliente
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isLoading, error } = useUser();

  const login = () => {
    // Redirige al usuario al endpoint del servidor
    router.push("/api/auth/login");
  };

  const logout = () => {
    // Redirige al usuario al endpoint de logout del servidor
    router.push("/api/auth/logout");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
