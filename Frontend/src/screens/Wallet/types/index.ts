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

export interface FRSData {
  title: string;
  rating: string;
  amount: string;
  rate: string;
  details: string;
}
