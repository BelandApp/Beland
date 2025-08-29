import { WalletAction } from "../types";
import {
  ExchangeIcon,
  SendIcon,
  ReceiveIcon,
  RechargeIcon,
} from "../../../components/icons";
import { useNavigation } from "@react-navigation/native";

export const useWalletActions = (
  showCustomAlert?: (
    title: string,
    message: string,
    type?: "success" | "error" | "info"
  ) => void
) => {
  const navigation = useNavigation();
  // Obtener rol del usuario
  const { user } = require("../../../hooks/AuthContext").useAuth();

  // Acciones principales del wallet
  const mainWalletActions: WalletAction[] = [
    {
      id: "recharge",
      label: "Recargar",
      icon: RechargeIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("RechargeScreen" as never),
    },
    {
      id: "send",
      label: "Enviar",
      icon: SendIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("SendScreen" as never),
    },
    {
      id: "receive",
      label: "Recibir",
      icon: ReceiveIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("ReceiveScreen" as never),
    },
  ];

  // Agregar botón Cobrar solo para roles permitidos
  if (
    (typeof user?.role_name === "string" &&
      ["COMMERCE", "ADMIN"].includes(user.role_name.toUpperCase())) ||
    (user?.role &&
      typeof user.role === "object" &&
      user.role.name &&
      user.role.name.toUpperCase() !== "USER")
  ) {
    mainWalletActions.push({
      id: "cobrar",
      label: "Cobrar",
      icon: require("../../../components/icons").CobrarIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("CobrarScreen" as never),
    });
  }

  // Acción final
  mainWalletActions.push({
    id: "exchange",
    label: "Canjear",
    icon: ExchangeIcon,
    backgroundColor: "#FFFFFF",
    onPress: () => {
      if (showCustomAlert) {
        showCustomAlert(
          "Funcionalidad en progreso",
          "Esta funcionalidad estará disponible próximamente.",
          "info"
        );
      }
    },
  });

  // Acciones secundarias - sin historial ya que está integrado en la vista principal
  const secondaryWalletActions: WalletAction[] = [];

  return {
    mainWalletActions,
    secondaryWalletActions,
    // Mantener retrocompatibilidad
    walletActions: mainWalletActions,
  };
};
