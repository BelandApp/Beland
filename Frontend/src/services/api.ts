import Constants from "expo-constants";

// Configuración base para los servicios de API
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://[::1]:3001/api";

console.log("🔧 Variables de entorno:");
console.log(
  "- process.env.EXPO_PUBLIC_API_URL:",
  process.env.EXPO_PUBLIC_API_URL
);
console.log(
  "- process.env.EXPO_PUBLIC_USE_DEMO_MODE:",
  process.env.EXPO_PUBLIC_USE_DEMO_MODE
);
console.log(
  "- Constants.expoConfig?.extra?.apiUrl:",
  Constants.expoConfig?.extra?.apiUrl
);
console.log(
  "- Constants.expoConfig?.extra?.useDemoMode:",
  Constants.expoConfig?.extra?.useDemoMode
);
console.log("✅ API_BASE_URL configurada:", API_BASE_URL);

// Configuración de headers por defecto
const defaultHeaders = {
  "Content-Type": "application/json",
}; // Función auxiliar para hacer requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: defaultHeaders,
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
};

export { apiRequest, API_BASE_URL };
