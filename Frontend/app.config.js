import "dotenv/config";

export default {
  expo: {
    name: "Beland",
    slug: "Beland",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "belandnative",
    owner: "beland",
    plugins: ["expo-secure-store"],
    extra: {
      auth0Domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN,
      auth0MobileClientId: process.env.EXPO_PUBLIC_AUTH0_MOBILE_CLIENT_ID,
      auth0WebClientId: process.env.EXPO_PUBLIC_AUTH0_WEB_CLIENT_ID,
      auth0Audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      useDemoMode: process.env.EXPO_PUBLIC_USE_DEMO_MODE,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      statusBarStyle: "light",
      statusBarBackgroundColor: "#F88D2A",
      bundleIdentifier: "com.belandapp.beland",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Esta aplicación necesita acceso a tu ubicación para encontrar puntos de reciclaje cercanos.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "Esta aplicación necesita acceso a tu ubicación para encontrar puntos de reciclaje cercanos.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      statusBar: {
        barStyle: "light-content",
        backgroundColor: "#F88D2A",
        hidden: true,
        translucent: true,
      },
      navigationBar: {
        visible: "sticky-immersive",
      },
      softwareKeyboardLayoutMode: "adjustResize",
      userInterfaceStyle: "light",
      package: "com.belandapp.beland",
      permissions: ["ACCESS_FINE_LOCATION", "ACCESS_COARSE_LOCATION"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
};
