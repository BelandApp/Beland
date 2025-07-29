import { useState } from "react";
import { FormErrors } from "../../../business/validation/groupValidation";

export const useCreateGroupForm = () => {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantInstagram, setNewParticipantInstagram] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Estados para alertas personalizadas
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  // Función para mostrar alertas personalizadas
  const showCustomAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const setError = (field: keyof FormErrors, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    // Estados
    newParticipantName,
    newParticipantInstagram,
    errors,
    isLoading,
    showAlert,
    alertConfig,

    // Setters
    setNewParticipantName,
    setNewParticipantInstagram,
    setErrors,
    setIsLoading,
    setShowAlert,

    // Funciones
    showCustomAlert,
    clearError,
    setError,
    clearAllErrors,
  };
};
