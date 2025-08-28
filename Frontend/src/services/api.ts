import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configuración base para los servicios de API
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  "http://[::1]:3001/api";

// Configuración de headers por defecto
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Función auxiliar para obtener el token desde localStorage (web) o AsyncStorage (móvil)
async function getAuthToken() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage.getItem("auth_token");
  } else {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch {
      return null;
    }
  }
}

// Función auxiliar para hacer requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Obtener token de localStorage o AsyncStorage
  const token = await getAuthToken();
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const err: any = new Error(
        (data && (data.error || data.message)) ||
          `HTTP error! status: ${response.status}`
      );
      err.status = response.status;
      err.body = data;
      throw err;
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export { apiRequest, API_BASE_URL };
