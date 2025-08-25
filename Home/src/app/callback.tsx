"use client";

import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import { Platform } from "react-native";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL as string;
const DEBUG_REDIRECT_URI = process.env
  .NEXT_PUBLIC_AUTH0_REDIRECT_URI_DEBUG as string;

const CallbackPage = () => {
  const { isLoading, error, isAuthenticated, getAccessTokenSilently } =
    useAuth0();
  const router = useRouter();

  useEffect(() => {
    const handleLoginCallback = async () => {
      if (isLoading || error) {
        if (error) {
          console.error("Auth0 error:", error);
        }
        return;
      }

      if (isAuthenticated) {
        try {
          const auth0Token = await getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
            },
          });

          const response = await fetch(
            `${BACKEND_API_URL}/auth/login-with-auth0`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth0Token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to authenticate with backend");
          }

          const data = await response.json();
          const customJwt = data.accessToken;

          if (customJwt) {
            // Decidimos la URL de redirección basada en la plataforma y el entorno
            let redirectUri;
            if (process.env.NODE_ENV === "production") {
              // En producción, usamos el deep link nativo
              redirectUri = `${process.env.NEXT_PUBLIC_AUTH0_REDIRECT_URI_NATIVE}?token=${customJwt}`;
            } else {
              // En desarrollo, usamos la URL de depuración (localhost o tunnel)
              redirectUri = `${DEBUG_REDIRECT_URI}?token=${customJwt}`;
            }

            console.log(`Attempting redirection with URI: ${redirectUri}`);
            window.location.href = redirectUri;
          } else {
            console.error("Backend did not return a custom JWT.");
            router.push("/login-error");
          }
        } catch (e) {
          console.error("Error during token exchange with backend:", e);
          router.push("/login-error");
        }
      }
    };

    handleLoginCallback();
  }, [isLoading, error, isAuthenticated, getAccessTokenSilently, router]);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Hubo un error al iniciar sesión.</div>;
  }

  return <div>Redireccionando...</div>;
};

export default CallbackPage;
