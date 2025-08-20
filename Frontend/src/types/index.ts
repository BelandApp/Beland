import { Product } from "./Products";

export interface Participant {
  id: string;
  name: string;
  instagramUsername?: string; // Usuario de Instagram
  instagramProfilePic?: string; // URL de la foto de perfil
  instagramFullName?: string; // Nombre completo desde Instagram
  isVerified?: boolean; // Si está verificado en Instagram
  isPayingForAll?: boolean; // Si paga por todos
  customAmount?: number; // Monto personalizado
}



export interface Group {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  deliveryTime: string;
  participantsList: Participant[];
  participants: number; // Para compatibilidad con mock data
  products: Product[];
  totalParticipants: number;
  totalAmount: number;
  myConsumption: number;
  costPerPerson: number;
  status: GroupStatus;
  beCoinsGenerated: number;
  createdAt: string;
  createdBy: string;
  paymentMode: PaymentMode;
  payingUserId?: string; // ID del usuario que paga por todos (cuando paymentMode es 'single_payer')
}

export type GroupStatus =
  | "active"
  | "pending_payment"
  | "completed"
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
