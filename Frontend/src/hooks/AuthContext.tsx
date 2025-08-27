import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  Platform,
  Alert,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useAuthTokenStore } from "../stores/useAuthTokenStore";
import {
  useBeCoinsStore,
  useBeCoinsStoreHydration,
} from "../stores/useBeCoinsStore";
import * as WebBrowser from "expo-web-Browser";
import {
  makeRedirectUri,
  useAuthRequest,
  exchangeCodeAsync,
  useAutoDiscovery,
} from "expo-auth-session";
import Constants from "expo-constants";
import { jwtDecode } from "jwt-decode";
import { supabase } from "../services/supabaseClient";

WebBrowser.maybeCompleteAuthSession();

// === CONFIGURACIÓN ===
const auth0Domain = Constants.expoConfig?.extra?.auth0Domain as string;
const clientWebId = Constants.expoConfig?.extra?.auth0WebClientId as string;
const scheme = Constants.expoConfig?.scheme as string;
const apiBaseUrl = Constants.expoConfig?.extra?.apiUrl as string;
const auth0Audience = Constants.expoConfig?.extra?.auth0Audience as string;

// Validar que las variables de entorno están disponibles
const configIsValid =
  auth0Domain && clientWebId && scheme && apiBaseUrl && auth0Audience;

// Resto del código de interfaces y contexto...
interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  auth0_id: string;
  beCoinsBalance?: number;
}

interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  loginWithAuth0: () => void;
  logout: () => void;
  isDemo: boolean;
  loginAsDemo: () => void;
  setSession: (token: string) => Promise<void>;
}

const AuthContext = createContext<UserContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  // Obtenemos los métodos del store de forma compatible
  const tokenStore = useAuthTokenStore();
  const beCoinsStore = useBeCoinsStore();
  useBeCoinsStoreHydration();

  // Si la configuración no es válida, no inicializamos los hooks
  if (!configIsValid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error: Falta la configuración de Auth0. Por favor, revisa tus archivos
          .env y app.config.js.
        </Text>
      </View>
    );
  }

  // Ahora podemos inicializar los hooks de Expo Auth Session de forma segura
  const redirectUri = makeRedirectUri({
    scheme,
    path: "auth",
  });

  const discovery = useAutoDiscovery(`https://${auth0Domain}`);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: clientWebId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: "code",
      usePKCE: true,
      extraParams: {
        audience: auth0Audience,
      },
    },
    discovery
  );

  const correctedApiBaseUrl = apiBaseUrl.includes("://")
    ? apiBaseUrl
    : `http://${apiBaseUrl}`;

  const fetchUserProfileFromBackend = useCallback(
    // ... (El resto de tu código es el mismo, solo he añadido la verificación inicial) ...
    async (token: string) => {
      try {
        const res = await fetch(`${correctedApiBaseUrl}/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`Error en el servidor: ${res.statusText}`);
        }

        const userProfile = await res.json();
        return userProfile;
      } catch (error) {
        console.error("❌ Error al obtener el perfil del backend:", error);
        throw error;
      }
    },
    [correctedApiBaseUrl]
  );

  const checkAndCreateSupabaseUser = useCallback(async (auth0User: any) => {
    // ... (código existente) ...
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("auth0_id", auth0User.sub)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("❌ Error consultando Supabase:", fetchError);
        throw new Error("Error en Supabase");
      }

      if (!existingUser) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({
            auth0_id: auth0User.sub,
            email: auth0User.email,
            name: auth0User.name || auth0User.nickname,
          })
          .select()
          .single();

        if (insertError) {
          console.error("❌ Error creando usuario en Supabase:", insertError);
          throw new Error("Fallo al registrar el usuario en Supabase.");
        }
        console.log("✅ Usuario creado en Supabase con éxito.");
        return newUser;
      }
      console.log("✅ Usuario ya existe en Supabase.");
      return existingUser;
    } catch (error) {
      console.error("❌ Error en el flujo de Supabase:", error);
      throw error;
    }
  }, []);

  const processAuthTokenAndSetSession = useCallback(
    // ... (código existente) ...
    async (token: string) => {
      try {
        const decodedToken: any = jwtDecode(token);
        const auth0User = {
          sub: decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
        };

        await checkAndCreateSupabaseUser(auth0User);
        const userProfile = await fetchUserProfileFromBackend(token);
        setUser(userProfile);
        setIsDemo(false);
        await tokenStore.setToken(token);
        if (userProfile?.beCoinsBalance) {
          beCoinsStore.setBalance(userProfile.beCoinsBalance);
        }
        console.log("✅ Sesión establecida con éxito.");
      } catch (err) {
        console.error(
          "❌ Error al procesar el token y establecer la sesión:",
          err
        );
        await tokenStore.clearToken();
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchUserProfileFromBackend,
      checkAndCreateSupabaseUser,
      tokenStore,
      beCoinsStore,
    ]
  );

  useEffect(() => {
    const handleAuth = async () => {
      if (response?.type === "success" && response.params?.code) {
        setIsLoading(true);
        try {
          if (discovery) {
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
            await processAuthTokenAndSetSession(accessToken);
          } else {
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error(
            "❌ Error durante el flujo de autenticación o sincronización con el backend:",
            err
          );
          Alert.alert(
            "Error de Autenticación",
            "Hubo un problema al iniciar sesión. Por favor, inténtalo de nuevo."
          );
          await tokenStore.clearToken();
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        console.error("❌ Error de autenticación de Auth0:", response.error);
        Alert.alert(
          "Error de Autenticación",
          "Hubo un problema con tu sesión de Auth0. Por favor, inténtalo de nuevo."
        );
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [
    response,
    request,
    discovery,
    redirectUri,
    clientWebId,
    processAuthTokenAndSetSession,
    tokenStore,
  ]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenStore.token;
      if (!token) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        await processAuthTokenAndSetSession(token);
      } catch (err) {
        console.error("❌ Error restaurando sesión:", err);
        await tokenStore.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [processAuthTokenAndSetSession, tokenStore]);

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
      auth0_id: "demo-auth0-id",
    });
    setIsDemo(true);
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
    setIsDemo(false);
    await tokenStore.clearToken();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});
