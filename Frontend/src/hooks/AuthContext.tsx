import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

type User = {
  name?: string;
  email?: string;
  picture?: string;
};

type AuthContextType = {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loginAsDemo: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isWeb = Platform.OS === "web";

  const domain = Constants.expoConfig?.extra?.auth0Domain ?? "";

  const clientId = isWeb
    ? Constants.expoConfig?.extra?.auth0WebClientId ?? ""
    : Constants.expoConfig?.extra?.auth0MobileClientId ?? "";

  // Configuración mejorada para mobile
  const redirectUri =
    Platform.OS === "web"
      ? "http://localhost:8081"
      : AuthSession.makeRedirectUri({
          scheme: "exp", // Usar el esquema de Expo
        });

  const discovery = {
    authorizationEndpoint: `https://${domain}/authorize`,
    tokenEndpoint: `https://${domain}/oauth/token`,
    revocationEndpoint: `https://${domain}/oauth/revoke`,
  };

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    const getAccessToken = async (code: string) => {
      try {
        setIsLoading(true); // Mostrar loading durante el intercambio de tokens

        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri,
            extraParams: {
              code_verifier: request?.codeVerifier!,
            },
          },
          discovery
        );

        const accessToken = tokenResult.accessToken;

        const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const userInfo = await userInfoResponse.json();
        setUser(userInfo);

        // Sin alert, transición directa y fluida
      } catch (error) {
        Alert.alert("Error", "No se pudo completar el inicio de sesión");
      } finally {
        setIsLoading(false); // Finalizar loading
      }
    };

    if (response?.type === "success" && response.params?.code) {
      getAccessToken(response.params.code);
    } else if (response?.type === "error") {
      setIsLoading(false);
    }
  }, [response]);

  const login = async () => {
    setIsLoading(true);
    try {
      const result = await promptAsync();

      if (result.type === "error") {
        Alert.alert(
          "Error de Autenticación",
          "No se pudo completar el inicio de sesión. Por favor, intenta nuevamente."
        );
        setIsLoading(false);
      } else if (result.type === "cancel") {
        // Usuario canceló, no mostrar error
        setIsLoading(false);
      }
      // Si es success, el loading se maneja en el useEffect
    } catch (error) {
      Alert.alert(
        "Error",
        "No se pudo completar el inicio de sesión. Por favor, intenta nuevamente."
      );
      setIsLoading(false);
    }
  };

  const loginWithEmailPassword = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Aquí irían las llamadas reales a tu backend
      // Por ahora simulamos un login exitoso para el demo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Crear usuario simulado basado en el email
      const simulatedUser: User = {
        name:
          email.split("@")[0].charAt(0).toUpperCase() +
          email.split("@")[0].slice(1),
        email: email,
        picture: undefined,
      };

      setUser(simulatedUser);
      return true;
    } catch (error) {
      console.error("Email login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      name: "Usuario Demo",
      email: "demo@beland.app",
      picture: undefined,
    };
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithEmailPassword,
        logout,
        loginAsDemo,
        isLoading,
      }}
    >
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
