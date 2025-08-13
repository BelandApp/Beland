// src/group-invitations/group-invitations.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeleteResult, LessThanOrEqual } from 'typeorm';
import { GroupInvitation } from './entities/group-invitation.entity';

@Injectable()
export class GroupInvitationsRepository extends Repository<GroupInvitation> {
  private readonly logger = new Logger(GroupInvitationsRepository.name);

  constructor(
    @InjectRepository(GroupInvitation)
    private readonly groupInvitationORMRepository: Repository<GroupInvitation>,
    protected dataSource: DataSource,
  ) {
    super(GroupInvitation, dataSource.createEntityManager());
  }

  /**
   * Busca una única invitación a grupo por su ID.
   * @param id El ID de la invitación.
   * @returns La entidad GroupInvitation o null si no se encuentra.
   */
  async findOneById(id: string): Promise<GroupInvitation | null> {
    return this.groupInvitationORMRepository.findOne({
      where: { id },
      relations: ['group', 'sender', 'invited_user'],
    });
  }

  /**
   * Busca una invitación PENDIENTE para un usuario específico en un grupo específico.
   * @param groupId El ID del grupo.
   * @param invitedUserId El ID del usuario invitado.
   * @returns La entidad GroupInvitation PENDIENTE o null si no se encuentra.
   */
  async findPendingInvitation(
    groupId: string,
    invitedUserId: string,
  ): Promise<GroupInvitation | null> {
    return this.groupInvitationORMRepository.findOne({
      where: {
        group: { id: groupId },
        invited_user: { id: invitedUserId },
        status: 'PENDING',
      },
      relations: ['group', 'sender', 'invited_user'],
    });
  }

  /**
   * Busca todas las invitaciones PENDIENTES enviadas a un usuario específico.
   * @param invitedUserId El ID del usuario que recibió las invitaciones.
   * @returns Una lista de entidades GroupInvitation PENDIENTES.
   */
  async findPendingInvitationsForUser(
    invitedUserId: string,
  ): Promise<GroupInvitation[]> {
    return this.groupInvitationORMRepository.find({
      where: {
        invited_user: { id: invitedUserId },
        status: 'PENDING',
      },
      relations: ['group', 'sender'],
    });
  }

  /**
   * Busca todas las invitaciones PENDIENTES cuya fecha de expiración ha pasado.
   * @returns Una lista de entidades GroupInvitation expiradas.
   */
  async findExpiredPendingInvitations(): Promise<GroupInvitation[]> {
    const comparisonDate = new Date(); // Capturamos la fecha actual en el momento de la consulta
    this.logger.debug(
      `findExpiredPendingInvitations(): Buscando invitaciones expiradas con fecha de comparación: ${comparisonDate.toISOString()}`,
    );
    return this.groupInvitationORMRepository.find({
      where: {
        status: 'PENDING',
        expires_at: LessThanOrEqual(comparisonDate), // Usamos la fecha capturada
      },
    });
  }

  /**
   * Guarda una entidad GroupInvitation en la base de datos.
   * Este método puede usarse tanto para crear nuevas invitaciones
   * como para actualizar las existentes (por ejemplo, cambiar el estado).
   * @param invitation La entidad GroupInvitation a guardar.
   * @returns La entidad GroupInvitation guardada.
   */
  async saveInvitation(invitation: GroupInvitation): Promise<GroupInvitation> {
    return this.groupInvitationORMRepository.save(invitation);
  }

  /**
   * Crea una nueva instancia de entidad GroupInvitation.
   * Este método solo inicializa la entidad en memoria; no la guarda en la base de datos.
   * @param invitationPartial Datos parciales de la entidad GroupInvitation.
   * @returns La nueva entidad GroupInvitation.
   */
  createInvitation(
    invitationPartial: Partial<GroupInvitation>,
  ): GroupInvitation {
    return this.groupInvitationORMRepository.create(invitationPartial);
  }

  /**
   * Elimina una invitación a grupo por su ID.
   * NOTA: Esto realiza un borrado físico. Úsalo con precaución.
   * Estamos sobrescribiendo el método 'delete' base para asegurar claridad.
   * @param id El ID de la invitación a grupo a eliminar.
   * @returns DeleteResult indicando el resultado de la operación de eliminación.
   */
  async delete(id: string): Promise<DeleteResult> {
    const result = await this.groupInvitationORMRepository.delete(id);
    this.logger.log(
      `delete(): Invitación ${id} eliminada permanentemente. Filas afectadas: ${result.affected}`,
    );
    return result;
  }
}
