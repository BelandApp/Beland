"use client";

import { useUser } from "@auth0/nextjs-auth0";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthComplete() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Si la sesión ya se estableció y el usuario no está cargando
    if (user && !isLoading) {
      // ✅ Redirige a la URL web de tu aplicación de React Native.
      // Pasa el token de acceso como un parámetro de URL.
      // Asegúrate de que tu app de React Native (web) pueda manejar esta ruta.
      const webRedirectUrl = `http://localhost:8081/login-success?userId=${user.sub}&token=YOUR_ACCESS_TOKEN_HERE`;

      // Simplemente usa window.location.href para la redirección
      window.location.href = webRedirectUrl;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (!user && !isLoading) {
    router.push("/");
    return null;
  }

  return <div>Redirigiendo a tu aplicación...</div>;
}
