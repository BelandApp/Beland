import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';

export interface respSocket {
  message: string;
  amount: number;
  success: boolean;
}

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) {
        client.disconnect(true);
        return;
      }

      // 👇 Validar JWT (usá tu secret del backend)
      const payload: any = jwt.verify(token, process.env.JWT_SECRET);

      // Supongamos que el payload trae { sub: userId, email, role, ... }
      const userId = payload.sub;

      // Unir al usuario a su sala única
      client.join(`user_${userId}`);
      console.log(`Usuario ${userId} conectado a sala user_${userId}`);
    } catch (err) {
      console.log('Error en handshake:', err);
      client.disconnect(true);
    }
  }
  
  // Método para notificar a un usuario
  notifyUser(userId: string, payload: respSocket) {
    this.server.to(`user_${userId}`).emit('payment-success', payload);
  }
}