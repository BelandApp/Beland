// notifications-socket.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationsService } from './notification-socket.service';
// (opcional) tu AuthService para validar JWT
// import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://beland.app',
    'https://*-beland-8081.exp.direct',
    'http://localhost:8081',
    'https://auth.expo.io/@beland/Beland',
    'belandnative://redirect',
    'http://localhost:8081/api',
    'https://eoy0nfm-beland-8081.exp.direct',
    'https://nl6egxw-anonymous-8081.exp.direct',
    'https://zef_jly-anonymous-8081.exp.direct', 
  ], credentials: true },
})
export class NotificationsGateway implements OnModuleInit {
  
  @WebSocketServer() 
  server: Server;
  
  constructor(private notificationsService: NotificationsService) {}

  onModuleInit (){
    this.server.on("connection", (socket: Socket) => {
      console.log('Cliente conectado.')
    })
  }
  
  
  // async handleConnection(socket: Socket) {
  //   try {
  //     // === Autenticación simple con token en auth ===
  //     const bearer = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  //     const token = bearer?.startsWith('Bearer ') ? bearer.slice(7) : bearer;

  //     // TODO: validar el token y extraer userId (recomendado)
  //     // const payload = this.authService.verifySocketToken(token);
  //     // const userId = payload.sub;

  //     // Si recién arrancás y no tenés JWT en sockets, podés probar con query:
  //     const userId = (socket.handshake.query.userId as string) || 'unknown';

  //     if (!userId) return socket.disconnect(true);

  //     socket.data.userId = userId;
  //     socket.join(`user:${userId}`);

  //     // Opcional: log
  //     // console.log(`Socket ${socket.id} conectado. Room: user:${userId}`);
  //   } catch {
  //     socket.disconnect(true);
  //   }
  // }

  // handleDisconnect(socket: Socket) {
  //   // console.log(`Socket ${socket.id} desconectado`);
  // }

  // === Métodos para emitir ===
  // notifyCommerceByUserId(userId: string, payload: any) {
  //   this.io.to(`user:${userId}`).emit('balanceUpdated', payload);
  // }

  // notifyTransactionReceived(userId: string, payload: any) {
  //   this.io.to(`user:${userId}`).emit('transactionReceived', payload);
  // }
}
