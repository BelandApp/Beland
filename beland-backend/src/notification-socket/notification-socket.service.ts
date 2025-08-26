// notifications-socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
// (opcional) tu AuthService para validar JWT
// import { AuthService } from '../auth/auth.service';

@Injectable()
@WebSocketGateway()
export class NotificationsService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() io: Server;
  // constructor(private authService: AuthService) {}

  async handleConnection(socket: Socket) {
    try {
      // === Autenticación simple con token en auth ===
      const bearer = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : bearer;

      // TODO: validar el token y extraer userId (recomendado)
      // const payload = this.authService.verifySocketToken(token);
      // const userId = payload.sub;

      // Si recién arrancás y no tenés JWT en sockets, podés probar con query:
      const userId = (socket.handshake.query.userId as string) || 'unknown';

      if (!userId) return socket.disconnect(true);

      socket.data.userId = userId;
      socket.join(`user:${userId}`);

      // Opcional: log
      // console.log(`Socket ${socket.id} conectado. Room: user:${userId}`);
    } catch {
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    // console.log(`Socket ${socket.id} desconectado`);
  }

  notifyTransactionReceived(userId: string, payload: any) {
    this.io.to(`user:${userId}`).emit('transactionReceived', payload);
  }
}
