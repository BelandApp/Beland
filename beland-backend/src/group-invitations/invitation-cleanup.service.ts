// src/group-invitations/invitation-cleanup.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GroupInvitationsService } from './group-invitations.service';

@Injectable()
export class InvitationCleanupService {
  private readonly logger = new Logger(InvitationCleanupService.name);

  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  /**
   * Tarea programada para manejar invitaciones expiradas (cambia el estado a 'EXPIRED').
   * Se ejecuta cada 30 segundos para pruebas, o diariamente a las 2:00 AM para producción.
   */
  // @Cron(CronExpression.EVERY_DAY_AT_2AM) // Configuración para producción
  @Cron('*/60 * * * * *') // PARA PRUEBAS: cada 60 segundos (con segundos al final)
  async handleCron(): Promise<void> {
    this.logger.debug(
      'handleCron(): Ejecutando tarea programada de limpieza de invitaciones expiradas...',
    );
    await this.groupInvitationsService.handleExpiredInvitations(); // Llama al método del servicio
    this.logger.debug(
      'handleCron(): Tarea de limpieza de invitaciones expiradas finalizada.',
    );
  }
}
