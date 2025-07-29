import { colors } from "../../../styles/colors";
import { formatUSDPrice } from "../../../constants";

export const useGroupsUtils = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return colors.belandGreen;
      case "pending_payment":
        return colors.belandOrange;
      case "completed":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "En curso";
      case "pending_payment":
        return "Pendiente pago";
      case "completed":
        return "Finalizado";
      default:
        return "Desconocido";
    }
  };

  const formatAmount = (amount: number | string) => {
    if (typeof amount === "number") {
      return formatUSDPrice(amount);
    }
    return amount;
  };

  return {
    getStatusColor,
    getStatusText,
    formatAmount,
  };
};
