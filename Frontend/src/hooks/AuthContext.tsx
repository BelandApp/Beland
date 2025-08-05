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
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const isWeb = Platform.OS === "web";

  const domain = Constants.expoConfig?.extra?.auth0Domain ?? "";

  const clientId = isWeb
    ? Constants.expoConfig?.extra?.auth0WebClientId ?? ""
    : Constants.expoConfig?.extra?.auth0MobileClientId ?? "";

  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: !isWeb, // proxy solo en mobile
  } as Partial<AuthSession.AuthSessionRedirectUriOptions>);
  Alert.alert("Redirect URI", redirectUri); // para debug

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
      } catch (error) {
        console.error("Token exchange or user fetch failed:", error);
      }
    };

    if (response?.type === "success" && response.params?.code) {
      getAccessToken(response.params.code);
    }
  }, [response]);

  const login = async () => {
    try {
      await promptAsync({
        useProxy: !isWeb, // solo usamos proxy en móvil
      } as Partial<AuthSession.AuthRequestPromptOptions>);
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
