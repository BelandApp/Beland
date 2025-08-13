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

  //   /**
  //    * Tarea programada para manejar invitaciones expiradas.
  //    * Se ejecuta todos los días a las 2:00 AM (CronExpression.EVERY_DAY_AT_2AM).
  //    *
  //    * Para pruebas, puedes usar una expresión más frecuente, como '*/30 * * * *' (cada 30 segundos).
  //    * Asegúrate de comentar la expresión de producción y descomentar la de prueba SOLO para testear.
  //    *
  //    * Las expresiones Cron se leen así:
  //    * segundo (opcional) | minuto | hora | día del mes | mes | día de la semana
  //    * (0-59)             | (0-59) | (0-23) | (1-31)      | (1-12) | (0-7, donde 0 y 7 son domingo)
  //    */
  //   @Cron(CronExpression.EVERY_DAY_AT_2AM) // Se ejecutará todos los días a las 2:00 AM
  @Cron('*/30 * * * *') // Descomenta esta línea y comenta la de arriba para pruebas (cada 30 segundos)
  async handleCron(): Promise<void> {
    this.logger.debug(
      'handleCron(): Ejecutando tarea programada de limpieza de invitaciones expiradas...',
    );
    await this.groupInvitationsService.handleExpiredInvitations();
    this.logger.debug(
      'handleCron(): Tarea de limpieza de invitaciones expiradas finalizada.',
    );
  }
}
