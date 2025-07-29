export interface Reward {
  id: number;
  title: string;
  description: string;
  cost: number;
  category: string;
  available: boolean;
  image: string;
  discount?: string;
  popular?: boolean;
}

export type RewardCategory =
  | "Todos"
  | "Alimentación"
  | "Compras"
  | "Transporte"
  | "Entretenimiento"
  | "Ecológico";
