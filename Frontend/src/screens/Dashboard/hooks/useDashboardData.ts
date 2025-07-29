import { RECENT_ACTIVITIES } from "../types/constants";
import { Activity } from "../types";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";

export const useDashboardData = () => {
  const { balance } = useBeCoinsStore();

  const userStats = {
    userName: "Zaire",
    coinsAmount: balance, // Usar balance real del store
    bottlesRecycled: 47,
  };

  const getRecentActivities = (): Activity[] => {
    return RECENT_ACTIVITIES;
  };

  return {
    userStats,
    activities: getRecentActivities(),
  };
};
