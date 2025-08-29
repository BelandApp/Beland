import { SocketService } from "src/services/SocketService";
import { useAuth } from "src/hooks/AuthContext";
import { useNotification } from "src/hooks/NotificationContext";
import { useEffect } from "react";
import { useRef } from "react";

export function usePaymentSocket(onPaymentSuccess: (data: any) => void) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const socketService = useRef<SocketService | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    socketService.current = new SocketService();
    socketService.current.connect(token);
    socketService.current.onPaymentSuccess(
      (data: { amount: number; message?: string; [key: string]: any }) => {
        console.log("Notificación recibida:", data);
        showNotification({
          title: "¡Venta recibida!",
          message: data?.message || `Has recibido un pago exitoso.`,
          amount: data?.amount,
        });
        onPaymentSuccess(data);
      }
    );
    return () => {
      socketService.current?.disconnect();
      socketService.current = null;
    };
  }, [user?.id]);
}
