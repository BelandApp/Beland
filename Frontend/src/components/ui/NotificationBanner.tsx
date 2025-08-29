import React from "react";
import "../../styles/notificationBanner.css";
import { useNotification } from "../../hooks/NotificationContext";

export const NotificationBanner: React.FC = () => {
  const { notification } = useNotification();

  if (!notification) return null;

  // Usar clases CSS importadas para animación
  const className = notification.visible ? "bounce-in" : "bounce-out";

  return (
    <div
      className={className}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
        padding: "18px 32px",
        minWidth: 260,
        maxWidth: 340,
        border: "2px solid #2ecc40",
        color: "#222",
        fontFamily: "Montserrat, Arial, sans-serif",
        opacity: notification.visible ? 1 : 0,
        pointerEvents: notification.visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: 18,
          marginBottom: 6,
          color: "#2ecc40",
        }}
      >
        {notification.title}
      </div>
      <div style={{ fontSize: 16, marginBottom: 4 }}>
        {notification.message}
      </div>
      {notification.amount !== undefined && (
        <div style={{ fontSize: 15, color: "#ff9800" }}>
          Monto: ${notification.amount}
        </div>
      )}
    </div>
  );
};
