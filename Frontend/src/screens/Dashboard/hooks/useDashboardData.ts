import { RECENT_ACTIVITIES } from "../types/constants";
import { Activity } from "../types";
import { useBeCoinsStore } from "../../../stores/useBeCoinsStore";

export const useDashboardData = () => {
  const { balance } = useBeCoinsStore();

  const userStats = {
    userName: "Zaire",
    coinsAmount: balance,
    bottlesRecycled: 0, // Inicial para producción
  };

  const getRecentActivities = (): Activity[] => {
    return []; // Inicial para producción
  };

  return {
    userStats,
    activities: getRecentActivities(),
  };
};
