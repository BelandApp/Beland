import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
} from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
const auth0Domain = "dev-vf7nz76r1qsjwysf.us.auth0.com";
const clientWebId = "jNonnDIwGXK83rtiKGkGYxegh4S8eANt";
const scheme = "belandnative";
const apiBaseUrl = "https://api.beland.app";

// Redirección con soporte a proxy y esquema nativo
const redirectUri = makeRedirectUri({
  scheme,
  useProxy: true,
} as any);

console.log("🔁 redirectUri:", redirectUri);

const discovery = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

// === TIPADO ===
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  isDemo: boolean;
  loginAsDemo: () => void;
}

// === CONTEXTO ===
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === PROVIDER ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientWebId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: "code", // <-- Ahora usamos Authorization Code Flow
      usePKCE: true,
    },
    discovery
  );

  const saveToken = async (token: string) => {
    if (Platform.OS === "web") {
      localStorage.setItem("access_token", token);
    } else {
      await SecureStore.setItemAsync("access_token", token);
    }
  };

  const getToken = async (): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem("access_token");
    } else {
      return await SecureStore.getItemAsync("access_token");
    }
  };

  const deleteToken = async () => {
    if (Platform.OS === "web") {
      localStorage.removeItem("access_token");
    } else {
      await SecureStore.deleteItemAsync("access_token");
    }
  };

  // === Manejo de Login con Auth0 ===
  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success" && response.params?.code) {
        try {
          // Intercambiar el código por el token
          const tokenResult = await exchangeCodeAsync(
            {
              code: response.params.code,
              clientId: clientWebId,
              redirectUri,
              extraParams: { code_verifier: request?.codeVerifier || "" },
            },
            discovery
          );

          const accessToken = tokenResult.accessToken;
          if (!accessToken) {
            console.error("❌ No se obtuvo accessToken");
            return;
          }

          // Obtener info de usuario
          const userInfoRes = await fetch(`https://${auth0Domain}/userinfo`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userInfo = await userInfoRes.json();

          const authUser: AuthUser = {
            id: userInfo.sub,
            email: userInfo.email,
            name: userInfo.name,
            picture: userInfo.picture,
          };

          // Guardar token y usuario
          await saveToken(accessToken);
          setUser(authUser);
          setIsDemo(false);

          // Insertar en tu backend / Supabase
          await fetch(`${apiBaseUrl}/api/auth/me`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authUser),
          });
        } catch (err) {
          console.error("❌ Error autenticando:", err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuth();
  }, [response]);

  // === Restaurar sesión al cargar ===
  useEffect(() => {
    const restoreSession = async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`https://${auth0Domain}/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userInfo = await res.json();

        const authUser: AuthUser = {
          id: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        };

        setUser(authUser);
        setIsDemo(false);
      } catch (err) {
        console.error("❌ Error restaurando sesión:", err);
        await deleteToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // === Funciones ===
  const loginWithAuth0 = () => {
    promptAsync({ useProxy: true } as any);
  };

  const loginAsDemo = () => {
    setUser({
      id: "demo-user",
      email: "demo@beland.app",
      name: "Usuario Demo",
      picture: "https://ui-avatars.com/api/?name=Demo+User",
    });
    setIsDemo(true);
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    setIsDemo(false);
    await deleteToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, loginWithAuth0, logout, isDemo, loginAsDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// === HOOK ===
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};
