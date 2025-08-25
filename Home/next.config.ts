// next.config.js
// Importamos el tipo de NextConfig para tener autocompletado y tipado
/** @type {import('next').NextConfig} */
const { withExpo } = require("@expo/next-adapter");

const nextConfig = {
  // Mantengo tu configuración actual
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // =========================================================
  // === CONFIGURACIÓN AGREGADA PARA REACT NATIVE Y EXPO ===
  // =========================================================
  experimental: {
    // Esto es CRUCIAL. Le dice a Next.js que compile los paquetes
    // de Expo y React Native que están escritos para un entorno diferente.
    transpilePackages: [
      "react-native",
      "react-native-web",
      "expo",
      "expo-constants",
      "expo-auth-session",
      "expo-secure-store",
      "expo-web-browser", // Añadido para el módulo que usa WebBrowser.maybeCompleteAuthSession
      // Si tienes más paquetes de Expo o de React Native, agrégalos aquí.
      // Puedes ver los que estás usando en el archivo AuthContext.tsx
    ],
  },
  // =========================================================
  // === FIN DE LA CONFIGURACIÓN AGREGADA ===
  // =========================================================
};

// Envolvemos toda tu configuración con el adaptador de Expo.
// Esto es lo que permite que Next.js entienda y resuelva
// todas las importaciones de React Native.
module.exports = withExpo(nextConfig);
