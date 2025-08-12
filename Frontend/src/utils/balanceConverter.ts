/**
 * Utilidad para convertir balances del backend al formato del frontend
 *
 * El backend puede devolver:
 * - Enteros: 250000 (representa 2500.00 BeCoins)
 * - Decimales: 2500.00 (valor directo)
 * - Strings decimales inconsistentes: "0.001000"
 *
 * Esta función normaliza todos los casos a un número decimal correcto.
 */

/**
 * Convierte un balance del backend (entero o decimal) al valor correcto en BeCoins
 */
export const convertBackendBalance = (
  backendBalance: number | string
): number => {
  // Si es string, parseamos directamente (backend revertido devuelve decimales como strings)
  if (typeof backendBalance === "string") {
    return parseFloat(backendBalance);
  }

  // Si es número y es entero grande, probablemente necesita división por 100
  if (Number.isInteger(backendBalance) && backendBalance >= 10000) {
    return backendBalance / 100;
  }

  // Si es número decimal, lo devolvemos tal como está
  return backendBalance;
};

/**
 * Convierte un amount de transacción del backend al valor correcto en BeCoins
 */
export const convertBackendTransactionAmount = (
  backendAmount: number | string
): number => {
  // Si es string, parseamos directamente
  if (typeof backendAmount === "string") {
    return parseFloat(backendAmount);
  }

  // Si es número entero grande, probablemente necesita división por 100
  if (Number.isInteger(backendAmount) && backendAmount >= 1000) {
    return backendAmount / 100;
  }

  // Si es número decimal, lo devolvemos tal como está
  return backendAmount;
};

/**
 * Verifica si un valor del backend parece ser un entero (necesita conversión)
 */
export const isBackendInteger = (value: number | string): boolean => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;

  // Si el valor es mayor a 1000 y es un número entero, probablemente necesita conversión
  return numericValue >= 1000 && Number.isInteger(numericValue);
};
