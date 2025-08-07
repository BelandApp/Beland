import { WalletAction } from "../types";
import {
  ExchangeIcon,
  TransactionIcon,
  SendIcon,
  ReceiveIcon,
  RechargeIcon,
  SettingsIcon,
} from "../../../components/icons";
import { useNavigation } from "@react-navigation/native";

export const useWalletActions = () => {
  const navigation = useNavigation();

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
    {
      id: "exchange",
      label: "Canjear",
      icon: ExchangeIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => navigation.navigate("CanjearScreen" as never),
    },
  ];

  // Acciones secundarias - sin historial ya que está integrado en la vista principal
  const secondaryWalletActions: WalletAction[] = [];

  return {
    mainWalletActions,
    secondaryWalletActions,
    // Mantener retrocompatibilidad
    walletActions: mainWalletActions,
  };
};
