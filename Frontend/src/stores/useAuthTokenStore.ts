import { create } from "zustand";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  auth0_id?: string;
  role?: string;
  role_name?: string;
  coins?: number;
}

interface AuthTokenState {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  clearToken: () => void;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}

const isWeb =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const useAuthTokenStore = create<AuthTokenState>((set) => ({
  token: isWeb ? localStorage.getItem("auth_token") : null,
  user: isWeb ? JSON.parse(localStorage.getItem("auth_user") || "null") : null,
  setToken: (token: string) => {
    set({ token });
    if (isWeb) localStorage.setItem("auth_token", token);
  },
  clearToken: () => {
    set({ token: null });
    if (isWeb) localStorage.removeItem("auth_token");
  },
  setUser: (user: AuthUser | null) => {
    set({ user });
    if (isWeb) localStorage.setItem("auth_user", JSON.stringify(user));
  },
  clearUser: () => {
    set({ user: null });
    if (isWeb) localStorage.removeItem("auth_user");
  },
}));
