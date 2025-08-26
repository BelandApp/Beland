// notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notification-socket.gateway';
import { NotificationsService } from './notification-socket.service';

@Module({
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsGateway], // <- para inyectarlo en otros servicios
})
export class NotificationsSocketModule {}