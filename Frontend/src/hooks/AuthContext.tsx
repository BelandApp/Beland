import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
import {
  authService,
  demoAuthService,
  User as ServiceUser,
} from "../services/authService";

WebBrowser.maybeCompleteAuthSession();

type User = {
  id?: string;
  name?: string;
  email?: string;
  picture?: string;
  isNewUser?: boolean; // Para saber si es un registro nuevo
};

// Configuración para usar modo demo o producción
const USE_DEMO_MODE = true; // Cambiar a false cuando tengas el backend listo

type AuthContextType = {
  user: User | null;
  login: () => Promise<void>;
  registerWithGoogle: () => Promise<void>; // Nueva función para registro con Google
  loginWithEmailPassword: (email: string, password: string) => Promise<boolean>;
  registerWithEmailPassword: (
    name: string,
    email: string,
    password: string
  ) => Promise<boolean>; // Nueva función para registro con email
  logout: () => void;
  loginAsDemo: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login"); // Para distinguir entre login y registro
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
        setIsLoading(true);

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

        // Aquí es donde integrarías con tu backend
        if (authMode === "register") {
          // FLUJO DE REGISTRO CON GOOGLE
          await handleGoogleRegistration(userInfo);
        } else {
          // FLUJO DE LOGIN CON GOOGLE
          await handleGoogleLogin(userInfo);
        }
      } catch (error) {
        Alert.alert("Error", "No se pudo completar la autenticación");
      } finally {
        setIsLoading(false);
      }
    };

    if (response?.type === "success" && response.params?.code) {
      getAccessToken(response.params.code);
    } else if (response?.type === "error") {
      setIsLoading(false);
    }
  }, [response, authMode]);

  // Función auxiliar para manejar el registro con Google
  const handleGoogleRegistration = async (userInfo: any) => {
    try {
      const googleData = {
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      let result: ServiceUser;

      if (USE_DEMO_MODE) {
        // Usar servicio de demo
        result = await demoAuthService.registerWithGoogle(googleData);
      } else {
        // Usar servicio real
        result = await authService.registerWithGoogle(googleData);
      }

      setUser({
        id: result.id,
        email: result.email,
        name: result.name,
        picture: result.picture,
        isNewUser: true,
      });

      Alert.alert(
        "¡Registro exitoso!",
        USE_DEMO_MODE
          ? "Tu cuenta ha sido creada en modo demo. ¡Bienvenido a Beland!"
          : "Tu cuenta ha sido creada correctamente con Google. ¡Bienvenido a Beland!"
      );
    } catch (error: any) {
      console.error("Google registration error:", error);

      if (error.message === "USER_ALREADY_EXISTS") {
        Alert.alert(
          "Cuenta existente",
          "Ya tienes una cuenta con este email. ¿Quieres iniciar sesión en su lugar?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Iniciar sesión",
              onPress: () => handleGoogleLogin(userInfo),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error de conexión",
          USE_DEMO_MODE
            ? "Error en modo demo. Intenta nuevamente."
            : "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente."
        );
      }
    }
  };

  // Función auxiliar para manejar el login con Google
  const handleGoogleLogin = async (userInfo: any) => {
    try {
      const googleData = {
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      let result: ServiceUser;

      if (USE_DEMO_MODE) {
        // Usar servicio de demo
        result = await demoAuthService.loginWithGoogle(googleData);
      } else {
        // Usar servicio real
        result = await authService.loginWithGoogle(googleData);
      }

      setUser({
        id: result.id,
        email: result.email,
        name: result.name,
        picture: result.picture,
        isNewUser: false,
      });
    } catch (error: any) {
      console.error("Google login error:", error);

      if (error.message === "USER_NOT_FOUND") {
        Alert.alert(
          "Cuenta no encontrada",
          "No encontramos una cuenta con este email. ¿Quieres crear una cuenta nueva?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Crear cuenta",
              onPress: () => handleGoogleRegistration(userInfo),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error de conexión",
          USE_DEMO_MODE
            ? "Error en modo demo. Intenta nuevamente."
            : "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente."
        );
      }
    }
  };

  const login = async () => {
    setAuthMode("login");
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
        setIsLoading(false);
      }
      // Si es success, el useEffect se encargará del resto
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert(
        "Error",
        "No se pudo completar el inicio de sesión. Por favor, intenta nuevamente."
      );
      setIsLoading(false);
    }
  };

  const registerWithGoogle = async () => {
    setAuthMode("register");
    setIsLoading(true);
    try {
      const result = await promptAsync();

      if (result.type === "error") {
        Alert.alert(
          "Error de Registro",
          "No se pudo completar el registro. Por favor, intenta nuevamente."
        );
        setIsLoading(false);
      } else if (result.type === "cancel") {
        setIsLoading(false);
      }
      // Si es success, el useEffect se encargará del resto
    } catch (error) {
      console.error("Register with Google error:", error);
      Alert.alert(
        "Error",
        "No se pudo completar el registro. Por favor, intenta nuevamente."
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
      const emailData = { email, password };
      let result: ServiceUser;

      if (USE_DEMO_MODE) {
        // Usar servicio de demo
        result = await demoAuthService.loginWithEmail(emailData);
      } else {
        // Usar servicio real
        result = await authService.loginWithEmail(emailData);
      }

      setUser({
        id: result.id,
        email: result.email,
        name: result.name,
        picture: result.picture,
      });
      return true;
    } catch (error: any) {
      console.error("Email login error:", error);

      if (error.message === "INVALID_CREDENTIALS") {
        Alert.alert(
          "Credenciales incorrectas",
          "Email o contraseña incorrectos. Por favor, verifica tus datos."
        );
      } else {
        Alert.alert(
          "Error de conexión",
          USE_DEMO_MODE
            ? "Error en modo demo. Intenta nuevamente."
            : "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente."
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmailPassword = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const registerData = { name, email, password };

      if (USE_DEMO_MODE) {
        // Usar servicio de demo
        await demoAuthService.registerWithEmail(registerData);
      } else {
        // Usar servicio real
        await authService.registerWithEmail(registerData);
      }

      return true;
    } catch (error: any) {
      console.error("Email registration error:", error);

      if (error.message === "EMAIL_ALREADY_EXISTS") {
        Alert.alert(
          "Email ya registrado",
          "Ya existe una cuenta con este email. ¿Quieres iniciar sesión en su lugar?"
        );
      } else {
        Alert.alert(
          "Error de conexión",
          USE_DEMO_MODE
            ? "Error en modo demo. Intenta nuevamente."
            : "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente."
        );
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoading(false); // Asegurar que el loading se resetee
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
        registerWithGoogle,
        loginWithEmailPassword,
        registerWithEmailPassword,
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
