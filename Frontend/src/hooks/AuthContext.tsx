import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform, Alert, ActivityIndicator } from "react-native";
import { authService } from "../services/authService";
import { apiRequest } from "../services/api";
import { useAuthTokenStore } from "../stores/useAuthTokenStore";
import {
  useBeCoinsStore,
  useBeCoinsStoreHydration,
} from "../stores/useBeCoinsStore";
import { walletService } from "../services/walletService";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
} from "expo-auth-session";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;

const scheme = Constants.expoConfig?.scheme as string;

const apiBaseUrl =
  (Constants.expoConfig?.extra?.apiUrl as string) || "http://localhost:3001";
const auth0Audience = "https://beland.onrender.com/api";

if (!auth0Domain || !clientWebId || !scheme || !apiBaseUrl) {
  console.error(
    "❌ Error: Las variables de entorno de Auth0 o API no están configuradas correctamente en app.config.js."
  );
}

const isWeb = Platform.OS === "web";

const redirectUri = makeRedirectUri({
  scheme,
  useProxy: !isWeb,
} as any);

console.log("🔁 redirectUri:", redirectUri);
console.log("Domain:", auth0Domain);
console.log("Client Web ID:", clientWebId);
console.log("Audience:", auth0Audience);
console.log("Redirect URI:", redirectUri);

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
  role?: string;
  full_name?: string;
  profile_picture_url?: string;
  role_name?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  isDemo: boolean;
  loginAsDemo: () => void;
  setSession: (token: string) => Promise<void>;
}

// === CONTEXTO ===
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Funciones auxiliares de manejo de token
const saveToken = async (token: string) => {
  useAuthTokenStore.getState().setToken(token);
  if (Platform.OS === "web") {
    localStorage.setItem("auth_token", token);
  } else {
    await SecureStore.setItemAsync("auth_token", token);
  }
};

const getToken = async (): Promise<string | null> => {
  if (Platform.OS === "web") {
    return localStorage.getItem("auth_token");
  } else {
    return await SecureStore.getItemAsync("auth_token");
  }
};

const deleteToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("auth_token");
  } else {
    await SecureStore.deleteItemAsync("auth_token");
  }
};

const fetchUserProfileFromBackend = async (
  token: string
): Promise<AuthUser> => {
  const res = await fetch(`${apiBaseUrl}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("❌ Error al obtener el perfil del backend:", errorData);
    throw new Error(
      errorData.message || "Error al obtener el perfil del backend."
    );
  }

  const backendUser = await res.json();
  return {
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.full_name || backendUser.username,
    picture: backendUser.profile_picture_url,
    role: backendUser.role_name,
    full_name: backendUser.full_name,
    profile_picture_url: backendUser.profile_picture_url,
    role_name: backendUser.role_name,
  };
};

// === PROVIDER ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  useBeCoinsStoreHydration();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const updateBeCoinsBalance = async (userEmail: string) => {
    try {
      if (!user) return;
      const wallet = await walletService.getWalletByUserId(user.email, user.id);
      if (wallet && wallet.becoin_balance !== undefined) {
        const balanceNum = Number(wallet.becoin_balance);
        useBeCoinsStore
          .getState()
          .setBalance(isNaN(balanceNum) ? 0 : balanceNum);
      }
    } catch (e) {
      console.error("No se pudo actualizar el balance de BeCoins:", e);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      updateBeCoinsBalance(user.email);
    }
  }, [user]);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientWebId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: "code",
      usePKCE: true,
      extraParams: {
        audience: auth0Audience,
        prompt: "login",
      },
    },
    discovery
  );

  // ✅ Nueva función para procesar un token y establecer la sesión
  const processAuthTokenAndSetSession = useCallback(async (token: string) => {
    try {
      if (!token) {
        console.error("❌ No se recibió token.");
        throw new Error("No token provided.");
      }

      await saveToken(token);
      const authUser = await fetchUserProfileFromBackend(token);
      setUser(authUser);
      setIsDemo(false);

      if (authUser?.email) {
        await updateBeCoinsBalance(authUser.email);
      }
    } catch (err) {
      console.error(
        "❌ Error al procesar el token y establecer la sesión:",
        err
      );
      await deleteToken();
      throw err; // Vuelve a lanzar el error para que el componente que llama lo pueda manejar
    } finally {
      setIsLoading(false);
    }
  }, []);

  // === Manejo de Login con Auth0 ===
  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success" && response.params?.code) {
        setIsLoading(true);
        try {
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
          console.log(accessToken, "✅ Access Token obtenido");
          await processAuthTokenAndSetSession(accessToken);
        } catch (err) {
          console.error(
            "❌ Error durante el flujo de autenticación o sincronización con el backend:",
            err
          );
          await deleteToken();
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        console.error("❌ Error de autenticación de Auth0:", response.error);
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [response, request, processAuthTokenAndSetSession]);

  // === Restaurar sesión al cargar ===
  useEffect(() => {
    const restoreSession = async () => {
      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        await processAuthTokenAndSetSession(token);
      } catch (err) {
        console.error("❌ Error restaurando sesión:", err);
        await deleteToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [processAuthTokenAndSetSession]);


  const loginWithAuth0 = () => {
    setIsLoading(true);
    promptAsync();
  };

  const loginAsDemo = () => {
    setUser({
      id: "demo-user-uuid",
      email: "demo@beland.app",
      name: "Usuario Demo",
      picture: "https://ui-avatars.com/api/?name=Demo+User&background=random",
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
      value={{
        user,
        isLoading,
        loginWithAuth0,
        logout,
        isDemo,
        loginAsDemo,
        setSession: processAuthTokenAndSetSession,
      }}>
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
