import { useState } from "react";

export const useTimeModal = () => {
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedHour, setSelectedHour] = useState("19");
  const [selectedMinute, setSelectedMinute] = useState("30");

  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, "0");
      options.push(hour);
    }
    return options;
  };

  const generateMinuteOptions = () => {
    const options = [];
    for (let i = 0; i < 60; i++) {
      const minute = i.toString().padStart(2, "0");
      options.push(minute);
    }
    return options;
  };

  const getFormattedDeliveryTime = () => {
    return `${selectedHour}:${selectedMinute}`;
  };

  const resetToDefaults = () => {
    setSelectedHour("19");
    setSelectedMinute("30");
  };

  return {
    // Estados
    showTimeModal,
    selectedHour,
    selectedMinute,

    // Setters
    setShowTimeModal,
    setSelectedHour,
    setSelectedMinute,

    // Funciones
    generateTimeOptions,
    generateMinuteOptions,
    getFormattedDeliveryTime,
    resetToDefaults,
  };
};
