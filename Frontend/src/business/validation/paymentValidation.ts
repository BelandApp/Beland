/**
 * Lógica de validación para pagos
 */

import { Group } from "../../types";
import { formatUSDPrice } from "../../constants";

/**
 * Valida si los montos personalizados suman correctamente al total
 */
export const validateCustomAmounts = (
  customAmounts: { [key: string]: string },
  group: Group
): boolean => {
  const totalCustom = Object.values(customAmounts).reduce(
    (sum, amount) => sum + (parseFloat(amount) || 0),
    0
  );

  // Permitir pequeñas diferencias por redondeo
  return Math.abs(totalCustom - group.totalAmount) < 0.01;
};

/**
 * Calcula el total de montos personalizados
 */
export const calculateCustomAmountsTotal = (customAmounts: {
  [key: string]: string;
}): number => {
  return Object.values(customAmounts).reduce(
    (sum, amount) => sum + (parseFloat(amount) || 0),
    0
  );
};

/**
 * Valida un monto individual
 */
export const validateAmount = (amount: string): boolean => {
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount >= 0;
};

/**
 * Formatea un monto para mostrar
 */
export const formatAmount = (amount: number): string => {
  return formatUSDPrice(amount);
};
