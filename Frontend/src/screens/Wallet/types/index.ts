export interface WalletData {
  balance: number;
  estimatedValue: string;
}

export interface WalletAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  backgroundColor?: string;
  onPress?: () => void;
}

export interface Transaction {
  id: string;
  type: "transfer" | "receive" | "recharge" | "exchange";
  amount: number;
  amount_beicon: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  from?: string;
  to?: string;
}

export interface FRSData {
  title: string;
  rating: string;
  amount: string;
  rate: string;
  details: string;
}
