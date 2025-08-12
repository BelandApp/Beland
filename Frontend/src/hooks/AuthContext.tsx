import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform, Alert } from "react-native";
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
import Constants from "expo-constants"; // Importar Constants para acceder a extra

WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
// Acceder a las variables de entorno desde Constants.expoConfig.extra
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;
const scheme = Constants.expoConfig?.scheme as string; // Usar el scheme definido en app.json/app.config.js
const apiBaseUrl =
  (Constants.expoConfig?.extra?.apiUrl as string) || "http://localhost:8081";
const auth0Audience = "https://beland.onrender.com/api";

// Validar que las variables de entorno estén definidas
if (!auth0Domain || !clientWebId || !scheme || !apiBaseUrl) {
  console.error(
    "❌ Error: Las variables de entorno de Auth0 o API no están configuradas correctamente en app.config.js."
  );
  // Puedes lanzar un error o manejarlo de otra manera, dependiendo de tu estrategia
  // throw new Error("Auth0 or API environment variables are missing.");
}

const isWeb = Platform.OS === "web";
// Redirección con soporte a proxy y esquema nativo
const redirectUri = makeRedirectUri({
  scheme,
  useProxy: !isWeb,
} as any);

const discovery = {
  authorizationEndpoint: `https://${auth0Domain}/authorize`,
  tokenEndpoint: `https://${auth0Domain}/oauth/token`,
  revocationEndpoint: `https://${auth0Domain}/oauth/revoke`,
};

// === TIPADO ===
export interface AuthUser {
  id: string; // ID de tu base de datos (UUID)
  email: string;
  name?: string; // full_name o username de tu DB
  picture?: string; // profile_picture_url de tu DB
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  isDemo: boolean;
  loginAsDemo: () => void;
  loginWithEmailPassword: (email: string, password: string) => Promise<boolean>;
  registerWithEmailPassword: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
    address: string,
    phone: string,
    country: string,
    city: string
  ) => Promise<true | string>;
}

// === CONTEXTO ===
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === PROVIDER ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Hidratar el store de BeCoins al iniciar la app
  useBeCoinsStoreHydration();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  // Helper para actualizar el balance real desde el backend
  const updateBeCoinsBalance = async (userEmail: string) => {
    try {
      const wallet = await walletService.getWalletByUserId(userEmail);
      if (wallet && wallet.becoin_balance !== undefined) {
        // Convertir a número por si viene como string
        const balanceNum = Number(wallet.becoin_balance);
        useBeCoinsStore
          .getState()
          .setBalance(isNaN(balanceNum) ? 0 : balanceNum);
      }
    } catch (e) {
      console.error("No se pudo actualizar el balance de BeCoins:", e);
    }
  };

  // Efecto para actualizar el balance de BeCoins desde el backend si ya hay usuario autenticado
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
      responseType: "code", // Usamos Authorization Code Flow con PKCE
      usePKCE: true,
      extraParams: {
        audience: auth0Audience,
      },
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

  // Función para obtener el perfil del usuario desde tu backend
  const fetchUserProfileFromBackend = async (
    token: string
  ): Promise<AuthUser> => {
    const res = await fetch(`${apiBaseUrl}auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("❌ Error al obtener el perfil del backend:", errorData);
      throw new Error(
        errorData.message || "Error al obtener el perfil del backend."
      );
    }

    const backendUser = await res.json();
    // Mapear los datos del backend a la interfaz AuthUser del frontend
    return {
      id: backendUser.id,
      email: backendUser.email,
      name: backendUser.full_name || backendUser.username, // Preferir full_name, si no username
      picture: backendUser.profile_picture_url,
    };
  };

  // === Manejo de Login con Auth0 ===
  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success" && response.params?.code) {
        try {
          // 1. Intercambiar el código por el token de acceso de Auth0
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
          if (!accessToken) {
            console.error("❌ No se obtuvo accessToken de Auth0.");
            throw new Error("No access token from Auth0.");
          }

          // 2. Guardar el token de Auth0 (este es el que el backend validará)
          await saveToken(accessToken);

          // 3. Llamar a tu backend para obtener el perfil del usuario.
          // El backend usará el accessToken para validar con Auth0 y sincronizar el usuario en Supabase.
          const authUser = await fetchUserProfileFromBackend(accessToken);

          // 4. Establecer el usuario en el estado del contexto
          setUser(authUser);
          setIsDemo(false);

          // 5. Actualizar el balance de BeCoins desde el backend
          if (authUser?.email) {
            await updateBeCoinsBalance(authUser.email);
          }
        } catch (err) {
          console.error(
            "❌ Error durante el flujo de autenticación o sincronización con el backend:",
            err
          );
          await deleteToken(); // Limpiar token si falla la autenticación o sincronización
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        console.error("❌ Error de autenticación de Auth0:", response.error);
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [response, request]); // Dependencias: response y request para el flujo de Auth0

  // === Restaurar sesión al cargar ===
  useEffect(() => {
    const restoreSession = async () => {
      // Limpiar wallet al iniciar la app para evitar persistencia entre usuarios
      useBeCoinsStore.getState().resetBalance();

      const token = await getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Llamar a tu backend para obtener el perfil del usuario.
        // El backend validará el token y devolverá el usuario de tu DB.
        const authUser = await fetchUserProfileFromBackend(token);

        setUser(authUser);
        setIsDemo(false);

        // Actualizar el balance de BeCoins desde el backend
        if (authUser?.email) {
          await updateBeCoinsBalance(authUser.email);
        }
      } catch (err) {
        console.error("❌ Error restaurando sesión:", err);
        await deleteToken(); // Limpiar token si falla la restauración
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []); // Se ejecuta solo una vez al montar el componente

  // === Login con email y password ===
  const loginWithEmailPassword = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      // Limpiar wallet al iniciar sesión para evitar persistencia entre usuarios
      useBeCoinsStore.getState().resetBalance();
      const setToken = useAuthTokenStore.getState().setToken;
      try {
        const loginResp = await authService.loginWithEmail({ email, password });
        const token = loginResp.token;
        if (!token) throw new Error("No se recibió token del backend");
        setToken(token);
        // Obtener datos del usuario con /auth/me
        const headers = { Authorization: `Bearer ${token}` };
        try {
          const userResp = await apiRequest("/auth/me", {
            method: "GET",
            headers,
          });
          setUser({
            id: userResp.id,
            email: userResp.email,
            name: userResp.name || userResp.full_name,
            picture: userResp.profile_picture_url,
          });
          setIsDemo(false);
          return true;
        } catch (meError) {
          console.error("[LOGIN] Error al llamar /auth/me:", meError);
          return false;
        }
      } catch (error: any) {
        console.error("[LOGIN] Error en loginWithEmail:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // === Registro con email y password ===
  const registerWithEmailPassword = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
      address: string,
      phone: string,
      country: string,
      city: string
    ): Promise<true | string> => {
      setIsLoading(true);
      const setToken = useAuthTokenStore.getState().setToken;
      try {
        const body = {
          full_name: name,
          email,
          password,
          confirmPassword,
          address,
          phone: Number(phone),
          country,
          city,
          username: email.split("@")[0],
          profile_picture_url: undefined,
        };
        const registerResp = await authService.registerWithEmail(body);
        const token = registerResp.token;
        if (!token) throw new Error("No se recibió token del backend");
        setToken(token);
        setUser({ id: email, email, name });
        setIsDemo(false);
        return true;
      } catch (error: any) {
        // Log detallado del error
        // ...existing code...
        if (error?.status === 409 || error?.status === 401) {
          return "EMAIL_ALREADY_EXISTS";
        }
        if (!error.status || error.status >= 500) {
          return "NETWORK_ERROR";
        }
        // Mostrar el mensaje de error si existe
        if (error?.message) {
          alert(
            "Error: " +
              error.message +
              (error?.body ? "\n" + JSON.stringify(error.body) : "")
          );
        }
        return "REGISTRATION_ERROR";
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const loginWithAuth0 = () => {
    // `promptAsync` inicia el flujo de autenticación
    promptAsync();
  };

  const loginAsDemo = () => {
    setUser({
      id: "demo-user-uuid", // Un UUID de ejemplo para el usuario demo
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
    // Limpiar el store de BeCoins (wallet) para evitar persistencia entre usuarios
    useBeCoinsStore.getState().resetBalance();
    // Opcional: Redirigir a Auth0 para cerrar sesión completamente (logout de Auth0)
    // WebBrowser.openAuthSessionAsync(`https://${auth0Domain}/v2/logout?client_id=${clientWebId}&returnTo=${encodeURIComponent(redirectUri)}`);
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
        loginWithEmailPassword,
        registerWithEmailPassword,
      }}
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
