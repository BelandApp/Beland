import React from "react";
import "../../styles/notificationBanner.css";
import { useNotification } from "../../hooks/NotificationContext";

export const NotificationBanner: React.FC = () => {
  const { notification, hideNotification } = useNotification();

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

      {/* Botón OK para notificaciones persistentes */}
      {notification.persistent && (
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <button
            onClick={hideNotification}
            style={{
              background: "#2ecc40",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Montserrat, Arial, sans-serif",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#27ae60";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#2ecc40";
            }}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
