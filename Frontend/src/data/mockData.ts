import { Group } from "../types";
import { convertPesoToUSD } from "../constants/currency";

export const MOCK_GROUPS: Group[] = [
  {
    id: "1",
    name: "Cumpleaños de Ana",
    type: "Cumpleaños",
    description: "Celebración del cumpleaños de Ana con comida y bebidas",
    location: "Palermo, CABA",
    deliveryTime: "19:30",
    participantsList: [
      { id: "creator", name: "Tú (Creador)", instagramUsername: "mi_usuario" },
      { id: "p1", name: "Ana Martínez", instagramUsername: "ana_martinez" },
      { id: "p2", name: "Carlos González", instagramUsername: "carlosg" },
      { id: "p3", name: "Laura Rodríguez", instagramUsername: "laura_rod" },
    ],
    participants: 8,
    products: [
      {
        id: "1",
        name: "Pizza Grande",
        quantity: 3,
        estimatedPrice: convertPesoToUSD(6500), // ~$18.57
        totalPrice: convertPesoToUSD(19500), // ~$55.71
      },
      {
        id: "2",
        name: "Gaseosas",
        quantity: 2,
        estimatedPrice: convertPesoToUSD(3600), // ~$10.29
        totalPrice: convertPesoToUSD(7200), // ~$20.57
      },
    ],
    totalParticipants: 8,
    totalAmount: convertPesoToUSD(26700), // ~$76.29
    myConsumption: convertPesoToUSD(3337), // ~$9.53
    costPerPerson: convertPesoToUSD(3337), // ~$9.53
    status: "active",
    beCoinsGenerated: Math.round(convertPesoToUSD(267)), // ~0.76
    createdAt: "2025-01-15T10:00:00.000Z",
    createdBy: "user_1",
    paymentMode: "equal_split",
  },
  {
    id: "2",
    name: "Asado Familiar",
    type: "Almuerzo",
    description: "Asado en familia para el domingo",
    location: "Villa Urquiza, CABA",
    deliveryTime: "13:00",
    participantsList: [
      { id: "creator", name: "Tú (Creador)", instagramUsername: "mi_usuario" },
      {
        id: "p4",
        name: "Roberto Silva",
        instagramUsername: "robertos",
        isPayingForAll: true,
      },
      { id: "p5", name: "María López", instagramUsername: "maria_lopez" },
      { id: "p6", name: "Pedro Díaz", instagramUsername: "pedro_diaz" },
    ],
    participants: 12,
    products: [
      {
        id: "3",
        name: "Carne (3kg)",
        quantity: 1,
        estimatedPrice: convertPesoToUSD(12000), // ~$34.29
        totalPrice: convertPesoToUSD(12000), // ~$34.29
      },
      {
        id: "4",
        name: "Ensaladas",
        quantity: 4,
        estimatedPrice: convertPesoToUSD(2500), // ~$7.14
        totalPrice: convertPesoToUSD(10000), // ~$28.57
      },
    ],
    totalParticipants: 12,
    totalAmount: convertPesoToUSD(22000), // ~$62.86
    myConsumption: 0,
    costPerPerson: 0,
    status: "pending_payment",
    beCoinsGenerated: Math.round(convertPesoToUSD(220)), // ~0.63
    createdAt: "2025-01-14T08:30:00.000Z",
    createdBy: "user_2",
    paymentMode: "single_payer",
    payingUserId: "p4",
  },
  {
    id: "3",
    name: "Cena de Trabajo",
    type: "Cena",
    description: "Cena con el equipo de desarrollo",
    location: "Puerto Madero, CABA",
    deliveryTime: "20:00",
    participantsList: [
      {
        id: "creator",
        name: "Tú (Creador)",
        instagramUsername: "mi_usuario",
        customAmount: convertPesoToUSD(8000), // ~$22.86
      },
      {
        id: "p7",
        name: "Sofía Torres",
        instagramUsername: "sofia_torres",
        customAmount: convertPesoToUSD(12000), // ~$34.29
      },
      {
        id: "p8",
        name: "Diego Morales",
        instagramUsername: "diego_m",
        customAmount: convertPesoToUSD(6000), // ~$17.14
      },
      {
        id: "p9",
        name: "Carmen Vega",
        instagramUsername: "carmen_v",
        customAmount: convertPesoToUSD(8000), // ~$22.86
      },
    ],
    participants: 6,
    products: [
      {
        id: "5",
        name: "Sushi Variado",
        quantity: 8,
        estimatedPrice: convertPesoToUSD(4200), // ~$12.00
        totalPrice: convertPesoToUSD(33600), // ~$96.00
      },
      {
        id: "6",
        name: "Vino Tinto",
        quantity: 2,
        estimatedPrice: convertPesoToUSD(3250), // ~$9.29
        totalPrice: convertPesoToUSD(6500), // ~$18.57
      },
    ],
    totalParticipants: 6,
    totalAmount: convertPesoToUSD(40100), // ~$114.57
    myConsumption: convertPesoToUSD(8000), // ~$22.86
    costPerPerson: convertPesoToUSD(5675), // ~$16.21
    status: "completed",
    beCoinsGenerated: Math.round(convertPesoToUSD(401)), // ~1.15
    createdAt: "2025-01-10T16:45:00.000Z",
    createdBy: "user_3",
    paymentMode: "custom_amounts",
  },
];
