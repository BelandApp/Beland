import { WalletAction } from "../types";
import {
  ExchangeIcon,
  TransactionIcon,
  SendIcon,
  ReceiveIcon,
} from "../../../components/icons";

export const useWalletActions = () => {
  const walletActions: WalletAction[] = [
    {
      id: "exchange",
      label: "Canjear",
      icon: ExchangeIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => console.log("Canjear pressed"),
    },
    {
      id: "history",
      label: "Transacciones",
      icon: TransactionIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => console.log("Transacciones pressed"),
    },
    {
      id: "send",
      label: "Enviar",
      icon: SendIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => console.log("Enviar pressed"),
    },
    {
      id: "receive",
      label: "Recibir",
      icon: ReceiveIcon,
      backgroundColor: "#FFFFFF",
      onPress: () => console.log("Recibir pressed"),
    },
  ];

  return {
    walletActions,
  };
};
