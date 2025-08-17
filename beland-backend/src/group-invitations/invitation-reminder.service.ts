// src/group-invitations/invitation-reminder.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { GroupInvitationsService } from './group-invitations.service';

@Injectable()
export class InvitationReminderService {
  private readonly logger = new Logger(InvitationReminderService.name);

  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  /**
   * Tarea programada para enviar recordatorios de invitaciones pendientes.
   * Se ejecuta cada 15 segundos para pruebas, o cada hora para producción.
   */
  @Cron(CronExpression.EVERY_30_MINUTES) // Ejemplo para producción: cada hora
  // @Cron('*/60 * * * * *') // PARA PRUEBAS: cada 60 segundos (con segundos al final)
  async handleReminderCron(): Promise<void> {
    this.logger.debug(
      'handleReminderCron(): Ejecutando tarea programada de envío de recordatorios de invitaciones...',
    );
    await this.groupInvitationsService.sendInvitationReminders(); // Llama al método del servicio
    this.logger.debug(
      'handleReminderCron(): Tarea de recordatorios de invitaciones finalizada.',
    );
  }
}
