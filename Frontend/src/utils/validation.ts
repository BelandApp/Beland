import {
  VALIDATION_RULES,
  formatUSDPrice,
  CURRENCY_CONFIG,
} from "../constants";

export const validateEmail = (email: string): boolean => {
  return VALIDATION_RULES.EMAIL_FORMAT.test(email);
};

export const validateTime = (time: string): boolean => {
  return VALIDATION_RULES.TIME_FORMAT.test(time);
};

export const formatTime = (text: string): string => {
  // Solo permitir números y ':'
  const formattedText = text.replace(/[^0-9:]/g, "");

  // Auto-formatear hora (agregar : después de 2 dígitos)
  if (formattedText.length === 2 && !formattedText.includes(":")) {
    return formattedText + ":";
  } else if (formattedText.length <= 5) {
    return formattedText;
  }

  return text;
};

export const formatCurrency = (amount: number | string): string => {
  const numAmount =
    typeof amount === "number" ? amount : parseFloat(amount.toString());
  return `${CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}${formatUSDPrice(
    numAmount
  )}`;
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const calculateBeCoins = (
  totalAmount: number,
  percentage: number = 0.1
): number => {
  return Math.floor(totalAmount * percentage);
};
