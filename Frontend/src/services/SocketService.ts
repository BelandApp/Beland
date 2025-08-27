import { io, Socket } from "socket.io-client";

export interface RespSocket {
  message: string;
  amount: number;
  success: boolean;
}

export class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(
      process.env.EXPO_PUBLIC_WS_URL || "https://beland.app/realtime",
      {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
      }
    );
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
