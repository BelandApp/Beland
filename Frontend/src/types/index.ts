import { Product } from "./Products";

export interface Participant {
  id: string;
  name: string;
  consumption: number;
}



export interface Group {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  deliveryTime: string;
  leader: string;
  products: Product[];
  participants: Participant[]; 
  totalAmount: number;
  costPerPerson: number;
  beCoinsEarned: number;
  myConsumption: number;
  status: GroupStatus; 
}

export type GroupStatus =
  | "active"
  | "pending_payment"
  | "completed"
  | "pending"
  | "cancelled";

export type PaymentMode =
  | "equal_split" // División equitativa entre todos
  | "single_payer" // Un solo usuario paga por todos
  | "custom_amounts"; // Cantidades personalizadas por participante

export interface FormErrors {
  groupName?: string;
  description?: string;
  location?: string;
  deliveryTime?: string;
  participants?: string;
  products?: string;
  newParticipantName?: string;
  newParticipantEmail?: string;
}

export interface AlertConfig {
  title: string;
  message: string;
  type: "success" | "error" | "info";
}

export { Product };
