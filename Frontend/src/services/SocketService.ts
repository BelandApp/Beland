import { io, Socket } from "socket.io-client";

export interface RespSocket {
  message: string;
  amount: number;
  success: boolean;
}

export class SocketService {
  onPaymentSuccess(
    callback: (data: { amount: number; [key: string]: any }) => void
  ) {
    this.socket?.on("payment-success", callback);
  }
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(
      process.env.EXPO_PUBLIC_WS_URL ||
        "https://beland-backend-266662044893.us-east1.run.app",
      {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
      }
    );
    const url =
      process.env.EXPO_PUBLIC_WS_URL ||
      "https://beland-backend-266662044893.us-east1.run.app";
    console.log("[SocketService] Conectando a:", url);
    this.socket = io(url, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
    });
    this.socket.on("connect", () => {
      console.log("[SocketService] Conectado. Socket ID:", this.socket?.id);
    });
    this.socket.on("connect_error", (err) => {
      console.error("[SocketService] Error de conexión:", err);
    });
    this.socket.on("disconnect", (reason) => {
      console.warn("[SocketService] Desconectado:", reason);
    });
  }

  onBalanceUpdated(callback: (data: RespSocket) => void) {
    this.socket?.on("balanceUpdated", (data) => {
      console.log("[SOCKET] balanceUpdated recibido:", data);
      callback(data);
    });
  }

  onTransactionReceived(callback: (data: RespSocket) => void) {
    this.socket?.on("transactionReceived", callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}
