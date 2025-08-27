import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Platform, Alert, View, Text, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  useAutoDiscovery,
} from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { SocketService, RespSocket } from "../services/SocketService";
// import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;
const scheme = Constants.expoConfig?.scheme as string;
const auth0Audience = Constants.expoConfig?.extra?.auth0Audience as string;
const apiBaseUrl = Constants.expoConfig?.extra?.apiUrl as string;

// Validar que las variables de entorno están disponibles
const configIsValid = auth0Domain && clientWebId && scheme && auth0Audience;

if (!configIsValid) {
  console.error(
    "❌ Las variables de entorno de Auth0 no están configuradas correctamente."
  );
}

// === TIPADO ===
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  picture?: string;
  auth0_id?: string;
  role?: string;
  role_name?: string;
  coins?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
  isLoading: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === Almacenamiento híbrido de token y usuario ===
const saveToken = async (token: string) => {
  if (Platform.OS === "web") {
    localStorage.setItem("auth_token", token);
  } else {
    await AsyncStorage.setItem("auth_token", token);
  }
};

const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem("auth_token");
  } else {
    return await AsyncStorage.getItem("auth_token");
  }
};

const deleteToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("auth_token");
  } else {
    await AsyncStorage.removeItem("auth_token");
  }
};

const saveUser = async (user: AuthUser) => {
  const userStr = JSON.stringify(user);
  if (Platform.OS === "web") {
    localStorage.setItem("auth_user", userStr);
  } else {
    await AsyncStorage.setItem("auth_user", userStr);
  }
};

const getUser = async (): Promise<AuthUser | null> => {
  let userStr;
  if (Platform.OS === "web") {
    userStr = localStorage.getItem("auth_user");
  } else {
    userStr = await AsyncStorage.getItem("auth_user");
  }
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

const deleteUser = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem("auth_user");
  } else {
    await AsyncStorage.removeItem("auth_user");
  }
};

// === PROVEEDOR ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // --- Socket.io integration (puedes re-agregarlo luego si lo necesitas) ---
  // const socketService = React.useRef<SocketService | null>(null);
  // const [socketData, setSocketData] = useState<RespSocket | null>(null);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect para socket y balance eliminado

  if (!configIsValid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error de configuración: Falta alguna variable de entorno de Auth0. Por
          favor, revisa tus archivos .env y app.config.js.
        </Text>
      </View>
    );
  }

  const discovery = useAutoDiscovery(`https://${auth0Domain}`);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientWebId,
      redirectUri: makeRedirectUri({
        scheme: scheme,
        path: Platform.select({ web: undefined, default: "callback" }),
      }),
      scopes: ["openid", "profile", "email", "offline_access"],
      usePKCE: true,
      extraParams: {
        audience: auth0Audience,
        prompt: "login", // Fuerza a que Auth0 muestre la pantalla de login
      },
    },
    discovery
  );

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await getToken();
      if (!token) {
        throw new Error("No hay token de autenticación.");
      }

      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    },
    []
  );

  const getProfile = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${apiBaseUrl}/auth/me`);
      if (!response.ok) {
        throw new Error(`Error al obtener perfil: ${response.statusText}`);
      }
      const data = await response.json();
      const userObj = {
        ...data,
        picture: data.profile_picture_url,
      };
      setUser(userObj);
      await saveUser(userObj);
      console.log("✅ Perfil de usuario obtenido exitosamente.");
    } catch (error) {
      console.error("❌ Error obteniendo perfil del usuario:", error);
      setUser(null);
      await deleteToken();
      await deleteUser();
      throw error;
    }
  }, [apiBaseUrl, fetchWithAuth]);

  // Se ha consolidado toda la lógica de inicialización en un solo useEffect.
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Restaurar sesión híbrida solo una vez al montar
        const token = await getToken();
        const storedUser = await getUser();
        if (token && storedUser) {
          setUser(storedUser);
        } else {
          setUser(null);
        }

        // Procesar redireccionamiento de Auth0 solo si hay response
        if (response && response.type === "success" && discovery) {
          const { code } = response.params;
          if (code) {
            const tokenResponse = await exchangeCodeAsync(
              {
                clientId: clientWebId,
                code,
                redirectUri: makeRedirectUri({
                  scheme: scheme,
                  path: Platform.select({
                    web: undefined,
                    default: "callback",
                  }),
                }),
                extraParams: {
                  code_verifier: request?.codeVerifier || "",
                },
              },
              discovery
            );
            if (tokenResponse.accessToken) {
              await saveToken(tokenResponse.accessToken);
              await getProfile();
            } else {
              throw new Error("accessToken no fue recibido.");
            }
          }
        }
      } catch (err) {
        setUser(null);
        await deleteToken();
        await deleteUser();
        Alert.alert(
          "Error de autenticación",
          "Fallo al iniciar sesión. Por favor, inténtelo de nuevo."
        );
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const loginWithAuth0 = () => {
    // Es importante establecer isLoading en true antes de iniciar el flujo
    // para que la interfaz de usuario muestre el estado de carga.
    setIsLoading(true);
    promptAsync();
  };

  const logout = async () => {
    setUser(null);
    await deleteToken();
    await deleteUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        loginWithAuth0,
        logout,

        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
