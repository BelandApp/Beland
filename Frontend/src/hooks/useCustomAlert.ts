import { useState } from "react";
import { AlertConfig } from "../types";

export const useCustomAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: "",
    message: "",
    type: "info",
  });

  const showCustomAlert = (
    title: string,
    message: string,
    type: AlertConfig["type"] = "info"
  ) => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  const hideAlert = () => {
    setShowAlert(false);
  };

  return {
    showAlert,
    alertConfig,
    showCustomAlert,
    hideAlert,
  };
};
