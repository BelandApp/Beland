export const APP_CONFIG = {
  BECOINS_PERCENTAGE: 0.1, // 10% en BeCoins
  NETWORK_DELAY: 1500, // Simular delay de red
  AUTO_NAVIGATION_DELAY: 2000, // Delay antes de navegar tras crear grupo
} as const;

export const VALIDATION_RULES = {
  GROUP_NAME_MIN_LENGTH: 3,
  DESCRIPTION_MIN_LENGTH: 10,
  PARTICIPANT_NAME_MIN_LENGTH: 2,
  TIME_FORMAT: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  EMAIL_FORMAT: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const UI_CONSTANTS = {
  MAX_PRODUCTS_PREVIEW: 2,
  TIME_INPUT_MAX_LENGTH: 5,
} as const;

// Re-exportar configuración de moneda y BeCoins
export {
  CURRENCY_CONFIG,
  convertPesoToUSD,
  formatUSDPrice,
  convertAndFormatPrice,
  BECOIN_CONFIG,
  formatBeCoins,
  formatBeCoinsWithValue,
  convertUSDToBeCoins,
  convertBeCoinsToUSD,
} from "./currency";
