import React, { createContext, useContext, useState, useCallback } from "react";

interface NotificationData {
  title: string;
  message: string;
  amount?: number;
  visible: boolean;
}

interface NotificationContextType {
  notification: NotificationData | null;
  showNotification: (data: Omit<NotificationData, "visible">) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );

  const showNotification = useCallback(
    (data: Omit<NotificationData, "visible">) => {
      setNotification({ ...data, visible: true });
      setTimeout(() => {
        setNotification((prev) => (prev ? { ...prev, visible: false } : null));
      }, 4000); // Oculta después de 4 segundos
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => (prev ? { ...prev, visible: false } : null));
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notification, showNotification, hideNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context)
    throw new Error(
      "useNotification debe usarse dentro de NotificationProvider"
    );
  return context;
};
