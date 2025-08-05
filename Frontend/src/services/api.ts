// Configuración base para los servicios de API
const API_BASE_URL = "YOUR_BACKEND_URL"; // Reemplazar con la URL real del backend

// Configuración de headers por defecto
const defaultHeaders = {
  "Content-Type": "application/json",
};

// Función auxiliar para hacer requests
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
