/**
 * Constantes para modos de pago
 */

import { PaymentMode } from "../types";

export interface PaymentModeOption {
  id: PaymentMode;
  title: string;
  description: string;
}

export const PAYMENT_MODE_OPTIONS: PaymentModeOption[] = [
  {
    id: "equal_split",
    title: "División Equitativa",
    description: "Todos los participantes pagan la misma cantidad",
  },
  {
    id: "single_payer",
    title: "Un Solo Pagador",
    description: "Una persona paga por todo el grupo",
  },
  {
    id: "custom_amounts",
    title: "Montos Personalizados",
    description: "Cada participante tiene un monto específico a pagar",
  },
];

export const PAYMENT_MODE_DESCRIPTIONS = {
  equal_split: "Todos pagan lo mismo",
  single_payer: "Una persona paga todo",
  custom_amounts: "Montos personalizados",
} as const;
