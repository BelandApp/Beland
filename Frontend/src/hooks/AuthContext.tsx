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
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  role_name?: string;
  coins?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isDemo: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  loginAsDemo: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// === Almacenamiento Seguro del Token ===
const tokenStorageKey = "auth0_jwt_token";

const saveToken = async (token: string) => {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(tokenStorageKey, token);
  } else {
    await SecureStore.setItemAsync(tokenStorageKey, token);
  }
};

const getToken = async () => {
  if (Platform.OS === "web") {
    return (await AsyncStorage.getItem(tokenStorageKey)) || null;
  } else {
    return (await SecureStore.getItemAsync(tokenStorageKey)) || null;
  }
};

const deleteToken = async () => {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(tokenStorageKey);
  } else {
    await SecureStore.deleteItemAsync(tokenStorageKey);
  }
};

// === PROVEEDOR ===
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Inicializamos isLoading en true para asegurar que la app esté en estado de carga
  // hasta que hayamos terminado de comprobar la sesión.
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

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
      setUser(data);
      console.log("✅ Perfil de usuario obtenido exitosamente.");
    } catch (error) {
      console.error("❌ Error obteniendo perfil del usuario:", error);
      setUser(null);
      await deleteToken();
      // Nota: Aquí no establecemos isLoading a false. Esto se maneja en el useEffect principal.
      throw error; // Re-lanzar el error para que el bloque try-catch externo lo capture.
    }
  }, [apiBaseUrl, fetchWithAuth]);

  // Se ha consolidado toda la lógica de inicialización en un solo useEffect.
  useEffect(() => {
    const initializeAuth = async () => {
      // El bloque try-catch-finally asegura que isLoading se establezca en false
      // solo al final de todo el proceso de inicialización, ya sea por éxito o fracaso.
      try {
        // 1. Intentar restaurar la sesión desde el almacenamiento seguro.
        const token = await getToken();
        if (token) {
          console.log("🔄 Restaurando sesión...");
          await getProfile();
        } else {
          console.log("🚫 No hay token almacenado.");
        }

        // 2. Manejar la respuesta del redireccionamiento de Auth0.
        // Esto solo se ejecuta si el usuario acaba de iniciar sesión a través del flujo de Auth0.
        if (response && response.type === "success" && discovery) {
          console.log("🔄 Procesando redireccionamiento de Auth0...");
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
                  code_verifier: request!.codeVerifier!,
                },
              },
              discovery!
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
        console.error("❌ Error en la inicialización o autenticación:", err);
        // Si hay un error, asegúrate de que el usuario no esté en un estado incorrecto.
        setUser(null);
        await deleteToken();
        Alert.alert(
          "Error de autenticación",
          "Fallo al iniciar sesión. Por favor, inténtelo de nuevo."
        );
      } finally {
        // Este es el ÚNICO lugar donde isLoading se establece en false,
        // garantizando que no haya parpadeos.
        setIsLoading(false);
        console.log("✅ Proceso de carga finalizado.");
      }
    };

    // No se usa una función auto-invocada, sino que se llama explícitamente
    // para que la promesa sea manejada correctamente.
    initializeAuth();
  }, [response, discovery, request, getProfile]); // Dependencias del efecto.

  const loginWithAuth0 = () => {
    // Es importante establecer isLoading en true antes de iniciar el flujo
    // para que la interfaz de usuario muestre el estado de carga.
    setIsLoading(true);
    promptAsync({ useProxy: true } as any);
  };

  const loginAsDemo = () => {
    setIsLoading(true); // Se inicia el estado de carga
    // Se establece el usuario demo
    setUser({
      id: "demo-user",
      email: "demo@beland.app",
      full_name: "Usuario Demo",
      picture: "https://ui-avatars.com/api/?full_name=Demo+User",
    });
    setIsDemo(true);
    // Se finaliza el estado de carga solo después de que el usuario demo ha sido establecido.
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
        fetchWithAuth,
      }}>
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
