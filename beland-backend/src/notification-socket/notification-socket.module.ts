// notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notification-socket.gateway';

@Module({
  providers: [NotificationsGateway],
  exports: [NotificationsGateway], // <- para inyectarlo en otros servicios
})
export class NotificationsSocketModule {}