"use client";

import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { Platform } from "react-native";

// === CONFIGURACIÓN DE AUTH0 ===
// Estos valores deben cargarse desde tus variables de entorno.
const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN as string;
const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID as string;
const auth0Audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE as string;
const auth0RedirectUriNative = process.env
  .NEXT_PUBLIC_AUTH0_REDIRECT_URI_NATIVE as string;

/**
 * Define la URL de redirección dinámicamente según la plataforma.
 * Para la web, usa la URL de la ventana. Para nativo, usa la variable de entorno.
 * @returns {string} La URL de redirección.
 */
const getRedirectUri = () => {
  // Si la app se está ejecutando en la web, usa una URL web estándar.
  if (Platform.OS === "web") {
    return `${window.location.origin}/callback`;
  }
  // Si es una app nativa (iOS o Android), usa el deep link.
  return auth0RedirectUriNative;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Componente que envuelve la aplicación con el proveedor de Auth0.
 * Este proveedor hace que los hooks de Auth0 (como useAuth0) estén disponibles
 * en todos los componentes hijos.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  if (!auth0Domain || !auth0ClientId || !auth0Audience) {
    console.error(
      "Las variables de entorno de Auth0 no están configuradas correctamente."
    );
    return <div>Error de configuración de autenticación.</div>;
  }

  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: getRedirectUri(), // Usa la función dinámica
        audience: auth0Audience,
      }}>
      {children}
    </Auth0Provider>
  );
};
