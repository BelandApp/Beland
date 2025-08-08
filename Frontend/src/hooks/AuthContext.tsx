import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { Platform, Alert } from "react-native";
import {
  demoAuthService,
  authService,
  User as ServiceUser,
} from "../services/authService";
import { apiRequest } from "../services/api";
import { useAuthTokenStore } from "../stores/useAuthTokenStore";
import { userService } from "../services/userService";
import { walletService } from "../services/walletService";
import { useBeCoinsStore } from "../stores/useBeCoinsStore";

WebBrowser.maybeCompleteAuthSession();

// --- Tipos y configuración ---
type User = {
  id?: string;
  name?: string;
  email?: string;
  picture?: string;
};

const USE_DEMO_MODE =
  Constants.expoConfig?.extra?.useDemoMode === "true" || false;

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  registerWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<boolean>;
  registerWithEmailPassword: (
    name: string,
    email: string,
    password: string
  ) => Promise<true | string>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const resetBalance = useBeCoinsStore((state) => state.resetBalance);
  const isWeb = Platform.OS === "web";

  // --- Auth0 config (solo si usas Google) ---
  const domain = Constants.expoConfig?.extra?.auth0Domain ?? "";
  const clientId = isWeb
    ? Constants.expoConfig?.extra?.auth0WebClientId ?? ""
    : Constants.expoConfig?.extra?.auth0MobileClientId ?? "";
  const redirectUri =
    Platform.OS === "web"
      ? "http://localhost:8081"
      : AuthSession.makeRedirectUri({ scheme: "exp" });
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

  // --- Google Auth Effect ---
  useEffect(() => {
    const getAccessToken = async (code: string) => {
      setIsLoading(true);
      try {
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId,
            code,
            redirectUri,
            extraParams: { code_verifier: request?.codeVerifier! },
          },
          discovery
        );
        const accessToken = tokenResult.accessToken;
        const userInfoResponse = await fetch(`https://${domain}/userinfo`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const userInfo = await userInfoResponse.json();
        if (authMode === "register") await handleGoogleRegistration(userInfo);
        else await handleGoogleLogin(userInfo);
      } catch {
        Alert.alert("Error", "No se pudo completar la autenticación");
      } finally {
        setIsLoading(false);
      }
    };
    if (response?.type === "success" && response.params?.code)
      getAccessToken(response.params.code);
    else if (response?.type === "error") setIsLoading(false);
  }, [response, authMode]);

  // --- Helpers Google ---
  const handleGoogleRegistration = useCallback(
    async (userInfo: any) => {
      try {
        let result: ServiceUser;
        if (USE_DEMO_MODE) {
          result = await demoAuthService.registerWithGoogle(userInfo);
        } else {
          try {
            const newUser = await userService.createUser({
              email: userInfo.email,
              oauth_provider: "google",
              username: userInfo.name || userInfo.email.split("@")[0],
              full_name: userInfo.name,
              profile_picture_url: userInfo.picture,
              role: "USER",
              password: "GoogleAuth123!",
              confirmPassword: "GoogleAuth123!",
              address: "Dirección pendiente por actualizar",
              phone: 1234567890,
              country: "Ecuador",
              city: "Quito",
              isBlocked: false,
            });
            await walletService.createWallet({
              userId: newUser.id,
              alias: userInfo.email.split("@")[0],
            });
            result = {
              id: newUser.id,
              email: newUser.email,
              name: newUser.full_name || userInfo.name,
              picture: newUser.profile_picture_url || userInfo.picture,
            };
          } catch (error: any) {
            if (
              error.message?.includes("already exists") ||
              error.message?.includes("duplicate") ||
              error.message?.includes("Conflict")
            ) {
              try {
                const existingUser = await userService.resolveUserByEmail(
                  userInfo.email
                );
                result = {
                  id: existingUser.id,
                  email: existingUser.email,
                  name: existingUser.full_name || userInfo.name,
                  picture: existingUser.profile_picture_url || userInfo.picture,
                };
              } catch {
                throw new Error("USER_ALREADY_EXISTS");
              }
            } else {
              throw error;
            }
          }
        }
        setUser({
          id: result.id,
          email: result.email,
          name: result.name,
          picture: result.picture,
        });
        resetBalance();
        Alert.alert(
          "¡Registro exitoso!",
          USE_DEMO_MODE
            ? "Tu cuenta ha sido creada en modo demo. ¡Bienvenido a Beland!"
            : "Tu cuenta ha sido creada correctamente con Google. ¡Bienvenido a Beland!"
        );
      } catch (error: any) {
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
    },
    [resetBalance]
  );

  const handleGoogleLogin = useCallback(
    async (userInfo: any) => {
      try {
        let result: ServiceUser;
        if (USE_DEMO_MODE) {
          result = await demoAuthService.loginWithGoogle(userInfo);
        } else {
          try {
            const existingUser = await userService.resolveUserByEmail(
              userInfo.email
            );
            result = {
              id: existingUser.id,
              email: existingUser.email,
              name:
                existingUser.full_name ||
                userInfo.name ||
                userInfo.email.split("@")[0],
              picture: existingUser.profile_picture_url || userInfo.picture,
            };
          } catch (error: any) {
            if (
              error.message?.includes("not found") ||
              error.message?.includes("No se encontro")
            )
              throw new Error("USER_NOT_FOUND");
            throw error;
          }
        }
        setUser({
          id: result.id,
          email: result.email,
          name: result.name,
          picture: result.picture,
        });
        resetBalance();
      } catch (error: any) {
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
    },
    [resetBalance, handleGoogleRegistration]
  );

  // --- Métodos públicos ---
  const login = useCallback(async () => {
    setAuthMode("login");
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === "error")
        Alert.alert(
          "Error de Autenticación",
          "No se pudo completar el inicio de sesión. Por favor, intenta nuevamente."
        );
    } catch {
      Alert.alert(
        "Error",
        "No se pudo completar el inicio de sesión. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync]);

  const registerWithGoogle = useCallback(async () => {
    setAuthMode("register");
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === "error")
        Alert.alert(
          "Error de Registro",
          "No se pudo completar el registro. Por favor, intenta nuevamente."
        );
    } catch {
      Alert.alert(
        "Error",
        "No se pudo completar el registro. Por favor, intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync]);

  const loginWithEmailPassword = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      const setToken = useAuthTokenStore.getState().setToken;
      try {
        if (USE_DEMO_MODE) {
          const result = await demoAuthService.loginWithEmail({
            email,
            password,
          });
          setUser({
            id: result.id,
            email: result.email,
            name: result.name,
            picture: result.picture,
          });
          resetBalance();
          return true;
        } else {
          // 1. Login: obtener token
          const loginResp = await authService.loginWithEmail({
            email,
            password,
          });
          const token = loginResp.token;
          if (!token) throw new Error("No se recibió token del backend");
          setToken(token);
          // 2. Obtener datos del usuario con /auth/me
          const userResp = await apiRequest("/auth/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({
            id: userResp.id,
            email: userResp.email,
            name: userResp.name || userResp.full_name,
            picture: userResp.profile_picture_url,
          });
          resetBalance();
          return true;
        }
      } catch (error: any) {
        setIsLoading(false);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [resetBalance]
  );

  const registerWithEmailPassword = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<true | string> => {
      setIsLoading(true);
      try {
        if (USE_DEMO_MODE) {
          await demoAuthService.registerWithEmail({ name, email, password });
          await demoAuthService.loginWithEmail({ email, password });
          setIsLoading(false);
          return true;
        } else {
          // Usar el endpoint correcto de registro
          let token: string | null = null;
          try {
            const registerResp = await authService.registerWithEmail({
              name,
              email,
              password,
            });
            // El backend debería devolver { token }
            token = registerResp.token;
          } catch (error: any) {
            console.log("[Registro] Error al registrar:", error);
            if (error?.status) {
              console.log("[Registro] Status:", error.status);
            }
            if (error?.body) {
              console.log("[Registro] Body:", error.body);
            }
            if (
              (error.status && error.status === 409) ||
              error.message?.includes("already exists") ||
              error.message?.includes("duplicate") ||
              error.message?.includes("Conflict")
            ) {
              setIsLoading(false);
              return "EMAIL_ALREADY_EXISTS";
            }
            if (!error.status || error.status >= 500) {
              Alert.alert(
                "Error de conexión",
                "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente."
              );
              setIsLoading(false);
              return "NETWORK_ERROR";
            }
            setIsLoading(false);
            return "REGISTRATION_ERROR";
          }
          // Guardar el token recibido tras registro
          if (token) {
            const setToken = useAuthTokenStore.getState().setToken;
            setToken(token);
            // Obtener datos del usuario con /auth/me
            const userResp = await apiRequest("/auth/me", {
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser({
              id: userResp.id,
              email: userResp.email,
              name: userResp.name || userResp.full_name,
              picture: userResp.profile_picture_url,
            });
            // Crear wallet solo si el registro fue exitoso
            try {
              let userId = userResp.id;
              if (!userId) {
                const resolvedUser = await userService.resolveUserByEmail(
                  email
                );
                userId = resolvedUser.id;
              }
              await walletService.createWallet({
                userId,
                alias: email.split("@")[0],
              });
            } catch (walletError) {
              // No mostrar error al usuario, solo log interno
              console.error(
                "❌ Error creando wallet tras registro:",
                walletError
              );
            }
            setIsLoading(false);
            return true;
          } else {
            setIsLoading(false);
            return "REGISTRATION_ERROR";
          }
        }
      } catch (error: any) {
        if (!error.status || error.status >= 500) {
          Alert.alert(
            "Error de conexión",
            USE_DEMO_MODE
              ? "Error en modo demo. Intenta nuevamente."
              : "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente."
          );
          setIsLoading(false);
          return "NETWORK_ERROR";
        }
        setIsLoading(false);
        return "REGISTRATION_ERROR";
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const logout = useCallback(() => {
    setUser(null);
    setIsLoading(false);
    resetBalance();
  }, [resetBalance]);

  // --- Context value ---
  const value: AuthContextType = {
    user,
    isLoading,
    login,
    registerWithGoogle,
    loginWithEmailPassword,
    registerWithEmailPassword,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
