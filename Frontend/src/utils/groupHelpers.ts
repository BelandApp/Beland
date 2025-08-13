import { CURRENT_USER_ID } from "../data/user";
import { Group } from "../types";
export function isUserAdminOfGroup(group: Group): boolean {
  return group.createdBy === CURRENT_USER_ID;
}
import { GroupStatus } from "../types";
import { colors } from "../styles/colors";

export const getStatusColor = (status: GroupStatus): string => {
  switch (status) {
    case "active":
      return colors.belandGreen;
    case "pending_payment":
      return colors.belandOrange;
    case "completed":
      return "#4CAF50";
    case "cancelled":
      return "#F44336";
    default:
      return "#9E9E9E";
  }
};

export const getStatusText = (status: GroupStatus): string => {
  switch (status) {
    case "active":
      return "Activo";
    case "pending_payment":
      return "Pago Pendiente";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return "Desconocido";
  }
};
