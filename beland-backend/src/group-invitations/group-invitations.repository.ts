// src/group-invitations/group-invitations.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  DeleteResult,
  LessThanOrEqual,
  IsNull, // <-- ¡IMPORTADO IsNull!
  Not,
} from 'typeorm';
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
   * Helper para crear un query builder con cargas ansiosas comunes para GroupInvitation
   * y sus relaciones. Asegura que las relaciones 'group', 'sender', 'invited_user'
   * se carguen para evitar problemas de N+1.
   * @param includeSoftDeleted Si se deben incluir las invitaciones marcadas como eliminadas lógicamente.
   * @returns Una instancia de TypeORM QueryBuilder.
   */
  private createQueryBuilderWithRelations(includeSoftDeleted: boolean = false) {
    const query = this.groupInvitationORMRepository
      .createQueryBuilder('invitation')
      .leftJoinAndSelect('invitation.group', 'group')
      .leftJoinAndSelect('invitation.sender', 'sender')
      .leftJoinAndSelect('invitation.invited_user', 'invited_user');

    if (!includeSoftDeleted) {
      query.andWhere('invitation.deleted_at IS NULL');
    }
    return query;
  }

  /**
   * Busca una única invitación a grupo por su ID.
   * @param id El ID de la invitación.
   * @param includeSoftDeleted Si se deben incluir las invitaciones marcadas como eliminadas lógicamente.
   * @returns La entidad GroupInvitation o null si no se encuentra.
   */
  async findOneById(
    id: string,
    includeSoftDeleted: boolean = false,
  ): Promise<GroupInvitation | null> {
    return this.createQueryBuilderWithRelations(includeSoftDeleted)
      .where('invitation.id = :id', { id })
      .getOne();
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
    return this.createQueryBuilderWithRelations() // No incluir soft-deleted por defecto
      .andWhere('invitation.group_id = :groupId', { groupId })
      .andWhere('invitation.invited_user_id = :invitedUserId', {
        invitedUserId,
      })
      .andWhere('invitation.status = :status', { status: 'PENDING' })
      .getOne();
  }

  /**
   * Busca todas las invitaciones PENDIENTES enviadas a un usuario específico.
   * @param invitedUserId El ID del usuario que recibió las invitaciones.
   * @returns Una lista de entidades GroupInvitation PENDIENTES.
   */
  async findPendingInvitationsForUser(
    invitedUserId: string,
  ): Promise<GroupInvitation[]> {
    return this.createQueryBuilderWithRelations()
      .andWhere('invitation.invited_user_id = :invitedUserId', {
        invitedUserId,
      })
      .andWhere('invitation.status = :status', { status: 'PENDING' })
      .orderBy('invitation.created_at', 'ASC')
      .getMany();
  }

  /**
   * Busca todas las invitaciones ACEPTADAS para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de entidades GroupInvitation ACEPTADAS.
   */
  async findAcceptedInvitationsForUser(
    userId: string,
  ): Promise<GroupInvitation[]> {
    return this.createQueryBuilderWithRelations()
      .andWhere('invitation.invited_user_id = :userId', { userId })
      .andWhere('invitation.status = :status', { status: 'ACCEPTED' })
      .orderBy('invitation.updated_at', 'DESC')
      .getMany();
  }

  /**
   * Busca todas las invitaciones RECHAZADAS para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de entidades GroupInvitation RECHAZADAS.
   */
  async findRejectedInvitationsForUser(
    userId: string,
  ): Promise<GroupInvitation[]> {
    return this.createQueryBuilderWithRelations()
      .andWhere('invitation.invited_user_id = :userId', { userId })
      .andWhere('invitation.status = :status', { status: 'REJECTED' })
      .orderBy('invitation.updated_at', 'DESC')
      .getMany();
  }

  /**
   * Busca todas las invitaciones CANCELADAS para un usuario específico (donde el usuario fue el invitado).
   * @param userId El ID del usuario.
   * @returns Una lista de entidades GroupInvitation CANCELADAS.
   */
  async findCanceledInvitationsForUser(
    userId: string,
  ): Promise<GroupInvitation[]> {
    return this.createQueryBuilderWithRelations()
      .andWhere('invitation.invited_user_id = :userId', { userId })
      .andWhere('invitation.status = :status', { status: 'CANCELED' })
      .orderBy('invitation.updated_at', 'DESC')
      .getMany();
  }

  /**
   * Busca todas las invitaciones EXPIRADAS para un usuario específico (donde el usuario fue el invitado).
   * @param userId El ID del usuario.
   * @returns Una lista de entidades GroupInvitation EXPIRADAS.
   */
  async findExpiredInvitationsForUser(
    userId: string,
  ): Promise<GroupInvitation[]> {
    return this.createQueryBuilderWithRelations()
      .andWhere('invitation.invited_user_id = :userId', { userId })
      .andWhere('invitation.status = :status', { status: 'EXPIRED' })
      .orderBy('invitation.updated_at', 'DESC')
      .getMany();
  }

  /**
   * Busca todas las invitaciones que han sido soft-deleted para un usuario específico (donde el usuario fue el invitado).
   * @param userId El ID del usuario.
   * @returns Una lista de entidades GroupInvitation soft-deleted.
   */
  async findSoftDeletedInvitationsForUser(
    userId: string,
  ): Promise<GroupInvitation[]> {
    return this.createQueryBuilderWithRelations(true) // Incluir soft-deleted
      .andWhere('invitation.invited_user_id = :userId', { userId })
      .andWhere('invitation.deleted_at IS NOT NULL') // Filtrar por deleted_at no nulo
      .orderBy('invitation.deleted_at', 'DESC')
      .getMany();
  }

  /**
   * Busca todas las invitaciones PENDIENTES cuya fecha de expiración ha pasado.
   * @returns Una lista de entidades GroupInvitation expiradas.
   */
  async findExpiredPendingInvitations(): Promise<GroupInvitation[]> {
    const comparisonDate = new Date();
    this.logger.debug(
      `findExpiredPendingInvitations(): Buscando invitaciones expiradas con fecha de comparación: ${comparisonDate.toISOString()}`,
    );
    return this.groupInvitationORMRepository.find({
      // Usamos find aquí para simplificar, no necesitamos relaciones ansiosas para el cron job
      where: {
        status: 'PENDING',
        expires_at: LessThanOrEqual(comparisonDate),
        deleted_at: IsNull(), // Solo procesar las que no han sido soft-deleted ya
      },
    });
  }

  /**
   * Guarda una entidad GroupInvitation en la base de datos.
   * @param invitation La entidad GroupInvitation a guardar.
   * @returns La entidad GroupInvitation guardada.
   */
  async saveInvitation(invitation: GroupInvitation): Promise<GroupInvitation> {
    return this.groupInvitationORMRepository.save(invitation);
  }

  /**
   * Crea una nueva instancia de entidad GroupInvitation.
   * @param invitationPartial Datos parciales de la entidad GroupInvitation.
   * @returns La nueva entidad GroupInvitation.
   */
  createInvitation(
    invitationPartial: Partial<GroupInvitation>,
  ): GroupInvitation {
    return this.groupInvitationORMRepository.create(invitationPartial);
  }

  /**
   * Realiza un "soft delete" en una invitación, marcándola como eliminada lógicamente.
   * @param id El ID de la invitación a soft-delete.
   * @returns El resultado de la operación de actualización.
   */
  async softDeleteInvitation(id: string): Promise<any> {
    const result = await this.groupInvitationORMRepository.update(
      { id },
      { deleted_at: new Date(), status: 'CANCELED' }, // También puedes cambiar el status a 'DELETED' si lo agregas al enum
    );
    this.logger.log(
      `softDeleteInvitation(): Invitación ${id} soft-deleted. Filas afectadas: ${result.affected}`,
    );
    return result;
  }

  /**
   * Elimina una invitación a grupo permanentemente (hard delete). Úsalo con precaución.
   * @param id El ID de la invitación a grupo a eliminar.
   * @returns DeleteResult indicando el resultado de la operación de eliminación.
   */
  async hardDeleteInvitation(id: string): Promise<DeleteResult> {
    // <-- Renombrado para claridad
    const result = await this.groupInvitationORMRepository.delete(id);
    this.logger.log(
      `hardDeleteInvitation(): Invitación ${id} eliminada permanentemente. Filas afectadas: ${result.affected}`,
    );
    return result;
  }
}
