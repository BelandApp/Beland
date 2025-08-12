import { create } from "zustand";

interface AuthTokenState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

const isWeb =
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const useAuthTokenStore = create<AuthTokenState>((set) => ({
  token: isWeb ? localStorage.getItem("auth_token") : null,
  setToken: (token: string) => {
    set({ token });
    if (isWeb) {
      localStorage.setItem("auth_token", token);
    }
    // En mobile, solo zustand (memoria)
  },
  clearToken: () => {
    set({ token: null });
    if (isWeb) {
      localStorage.removeItem("auth_token");
    }
    // En mobile, solo zustand (memoria)
  },
}));
