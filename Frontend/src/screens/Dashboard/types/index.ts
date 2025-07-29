export interface Activity {
  id: number;
  action: string;
  location: string;
  coins: number;
  date: string;
  type: "earn" | "spend";
}

export interface DashboardProps {
  userName?: string;
  coinsAmount?: number;
  bottlesRecycled?: number;
}
