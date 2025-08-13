// src/group-invitations/group-invitations.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupInvitationsRepository } from './group-invitations.repository';
import { CreateGroupInvitationDto } from './dto/create-group-invitation.dto';
import { GroupInvitationDto } from './dto/group-invitation.dto';
import { UsersService } from 'src/users/users.service';
import { GroupsService } from 'src/groups/groups.service';
import { GroupMembersService } from 'src/group-members/group-members.service';
import { plainToInstance } from 'class-transformer';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/users.entity';
import { CreateGroupMemberDto } from 'src/group-members/dto/create-group-member.dto';
import { GroupInvitation } from './entities/group-invitation.entity';
import { DataSource, IsNull } from 'typeorm';
import { LessThanOrEqual } from 'typeorm';

@Injectable()
export class GroupInvitationsService {
  private readonly logger = new Logger(GroupInvitationsService.name);

  constructor(
    private readonly groupInvitationsRepository: GroupInvitationsRepository,
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    @Inject(forwardRef(() => GroupMembersService))
    private readonly groupMembersService: GroupMembersService,
    private dataSource: DataSource,
  ) {}

  /**
   * Crea y envía una nueva invitación a grupo.
   * Busca al usuario invitado por email, nombre de usuario o número de teléfono.
   * @param createInvitationDto DTO que contiene los detalles de la invitación.
   * @param senderId El ID del usuario que envía la invitación.
   * @returns El GroupInvitationDto creado.
   * @throws NotFoundException si no se encuentra el grupo o el usuario invitado.
   * @throws ConflictException si el usuario ya es miembro o ya tiene una invitación PENDIENTE.
   * @throws BadRequestException si no se proporciona un identificador válido (email, username, phone) o si se intenta invitar a sí mismo.
   */
  async createInvitation(
    createInvitationDto: CreateGroupInvitationDto,
    senderId: string,
  ): Promise<GroupInvitationDto> {
    const { group_id, email, username, phone, role } = createInvitationDto;

    const sender = await this.usersService.findUserEntityById(senderId);
    if (!sender) {
      throw new NotFoundException(
        `Usuario remitente con ID "${senderId}" no encontrado.`,
      );
    }

    const group = await this.groupsService.findGroupById(group_id);
    if (!group) {
      throw new NotFoundException(`Grupo con ID "${group_id}" no encontrado.`);
    }

    let invitedUser: User | null = null;
    if (email) {
      invitedUser = await this.usersService.findOneByEmail(email);
    } else if (username) {
      invitedUser = await this.usersService.findOneByUsername(username);
    } else if (phone !== undefined && phone !== null) {
      const phoneNumber = Number(phone);
      if (isNaN(phoneNumber)) {
        throw new BadRequestException(
          'El número de teléfono debe ser numérico.',
        );
      }
      invitedUser = await this.usersService.findOneByPhone(phoneNumber);
    }

    if (!invitedUser) {
      throw new NotFoundException(
        'Usuario a invitar no encontrado con el email, nombre de usuario o teléfono proporcionados.',
      );
    }

    if (invitedUser.id === senderId) {
      throw new BadRequestException(
        'No puedes enviarte una invitación a ti mismo a un grupo.',
      );
    }

    const groupWithMembers = await this.groupsService.findGroupById(group_id);
    const isAlreadyMember = groupWithMembers.members.some(
      (member) => member.user.id === invitedUser.id,
    );
    if (isAlreadyMember) {
      throw new ConflictException(
        `El usuario ${invitedUser.email} ya es miembro del grupo "${group.name}".`,
      );
    }

    // LÓGICA CLAVE: Verificar SÓLO invitaciones PENDIENTES que no estén soft-deleted
    const existingPendingInvitation =
      await this.groupInvitationsRepository.findPendingInvitation(
        group_id,
        invitedUser.id,
      );
    if (existingPendingInvitation) {
      throw new ConflictException(
        `Ya existe una invitación PENDIENTE para el usuario ${invitedUser.email} al grupo "${group.name}".`,
      );
    }

    // Crea una nueva invitación (se le asignará un nuevo UUID automáticamente)
    const newInvitation = this.groupInvitationsRepository.createInvitation({
      group_id: group.id,
      sender_id: sender.id,
      invited_user_id: invitedUser.id,
      status: 'PENDING',
      // PARA PRODUCCIÓN: Vence en 3 días (descomenta esta línea y comenta la de abajo para producción)
      // expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      // PARA PRUEBAS: Descomenta la siguiente línea y comenta la de arriba para que expire en 30 segundos
      expires_at: new Date(Date.now() + 30 * 1000), // Expira en 30 segundos para pruebas
    });

    const savedInvitation =
      await this.groupInvitationsRepository.saveInvitation(newInvitation);
    this.logger.log(
      `createInvitation(): Invitación ${savedInvitation.id} creada para el usuario ${invitedUser.email} al grupo ${group.name}, expira el ${savedInvitation.expires_at}.`,
    );

    const fullInvitation = await this.groupInvitationsRepository.findOneById(
      savedInvitation.id,
    );

    return plainToInstance(GroupInvitationDto, fullInvitation);
  }

  /**
   * Recupera una invitación a grupo específica por su ID.
   * @param invitationId El ID de la invitación.
   * @param includeSoftDeleted Si se deben incluir las invitaciones marcadas como eliminadas lógicamente.
   * @returns El GroupInvitationDto.
   * @throws NotFoundException si no se encuentra la invitación.
   */
  async findInvitationById(
    invitationId: string,
    includeSoftDeleted: boolean = false,
  ): Promise<GroupInvitationDto> {
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
      includeSoftDeleted,
    );
    if (!invitation) {
      throw new NotFoundException(
        `Invitación a grupo con ID "${invitationId}" no encontrada.`,
      );
    }
    return plainToInstance(GroupInvitationDto, invitation);
  }

  /**
   * Recupera todas las invitaciones PENDIENTES para un usuario específico.
   * @param userId El ID del usuario que recibió las invitaciones.
   * @returns Una lista de GroupInvitationDto.
   */
  async findUserPendingInvitations(
    userId: string,
  ): Promise<GroupInvitationDto[]> {
    const invitations =
      await this.groupInvitationsRepository.findPendingInvitationsForUser(
        userId,
      );
    return invitations.map((inv) => plainToInstance(GroupInvitationDto, inv));
  }

  /**
   * Recupera todas las invitaciones ACEPTADAS para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de GroupInvitationDto.
   */
  async findUserAcceptedInvitations(
    userId: string,
  ): Promise<GroupInvitationDto[]> {
    const invitations =
      await this.groupInvitationsRepository.findAcceptedInvitationsForUser(
        userId,
      );
    return invitations.map((inv) => plainToInstance(GroupInvitationDto, inv));
  }

  /**
   * Recupera todas las invitaciones RECHAZADAS para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de GroupInvitationDto.
   */
  async findUserRejectedInvitations(
    userId: string,
  ): Promise<GroupInvitationDto[]> {
    const invitations =
      await this.groupInvitationsRepository.findRejectedInvitationsForUser(
        userId,
      );
    return invitations.map((inv) => plainToInstance(GroupInvitationDto, inv));
  }

  /**
   * Recupera todas las invitaciones CANCELADAS (por el remitente) para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de GroupInvitationDto.
   */
  async findUserCanceledInvitations(
    userId: string,
  ): Promise<GroupInvitationDto[]> {
    const invitations =
      await this.groupInvitationsRepository.findCanceledInvitationsForUser(
        userId,
      );
    return invitations.map((inv) => plainToInstance(GroupInvitationDto, inv));
  }

  /**
   * Recupera todas las invitaciones EXPIRADAS para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de GroupInvitationDto.
   */
  async findUserExpiredInvitations(
    userId: string,
  ): Promise<GroupInvitationDto[]> {
    const invitations =
      await this.groupInvitationsRepository.findExpiredInvitationsForUser(
        userId,
      );
    return invitations.map((inv) => plainToInstance(GroupInvitationDto, inv));
  }

  /**
   * Recupera todas las invitaciones que han sido soft-deleted para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de GroupInvitationDto.
   */
  async findUserSoftDeletedInvitations(
    userId: string,
  ): Promise<GroupInvitationDto[]> {
    const invitations =
      await this.groupInvitationsRepository.findSoftDeletedInvitationsForUser(
        userId,
      );
    return invitations.map((inv) => plainToInstance(GroupInvitationDto, inv));
  }

  /**
   * Maneja la aceptación de una invitación a grupo.
   * Agrega al usuario invitado como miembro al grupo.
   * @param invitationId El ID de la invitación a aceptar.
   * @param acceptingUserId El ID del usuario que acepta la invitación (debe coincidir con invited_user_id).
   * @returns El GroupInvitationDto actualizado.
   * @throws NotFoundException si no se encuentra la invitación.
   * @throws BadRequestException si la invitación no está pendiente, ha expirado o si el usuario no es el invitado.
   * @throws ConflictException si falla la adición del miembro (por ejemplo, ya es miembro, aunque ya se verifica antes).
   */
  async acceptInvitation(
    invitationId: string,
    acceptingUserId: string,
  ): Promise<GroupInvitationDto> {
    const invitation =
      await this.groupInvitationsRepository.findOneById(invitationId);

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `La invitación no está pendiente (estado actual: ${invitation.status}).`,
      );
    }

    // NUEVA LÓGICA: Verificar si la invitación ha expirado
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      // Opcional: Podrías querer cambiar el estado a 'EXPIRED' en la DB aquí directamente
      // invitation.status = 'EXPIRED';
      // await this.groupInvitationsRepository.saveInvitation(invitation);
      throw new BadRequestException('La invitación ha expirado.');
    }

    if (invitation.invited_user.id !== acceptingUserId) {
      throw new ForbiddenException(
        'No estás autorizado para aceptar esta invitación.',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createGroupMemberDto: CreateGroupMemberDto = {
        group_id: invitation.group.id,
        user_id: invitation.invited_user.id,
        role: 'MEMBER',
      };
      await this.groupMembersService.create(createGroupMemberDto);

      invitation.status = 'ACCEPTED';
      const updatedInvitation = await queryRunner.manager.save(
        GroupInvitation,
        invitation,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `acceptInvitation(): Invitación ${invitation.id} aceptada por el usuario ${acceptingUserId}. Usuario agregado al grupo ${invitation.group.name}.`,
      );
      return plainToInstance(GroupInvitationDto, updatedInvitation);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `acceptInvitation(): Fallo al aceptar invitación ${invitation.id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al aceptar la invitación debido a un error interno.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Maneja el rechazo de una invitación a grupo.
   * @param invitationId El ID de la invitación a rechazar.
   * @param rejectingUserId El ID del usuario que rechaza la invitación (debe coincidir con invited_user_id).
   * @returns El GroupInvitationDto actualizado.
   * @throws NotFoundException si no se encuentra la invitación.
   * @throws BadRequestException si la invitación no está pendiente, ha expirado o ya fue rechazada.
   * @throws ForbiddenException si el usuario no es el invitado.
   */
  async rejectInvitation(
    invitationId: string,
    rejectingUserId: string,
  ): Promise<GroupInvitationDto> {
    const invitation =
      await this.groupInvitationsRepository.findOneById(invitationId);

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `La invitación no está pendiente (estado actual: ${invitation.status}).`,
      );
    }

    // NUEVA LÓGICA: Verificar si la invitación ha expirado
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      // Opcional: Podrías querer cambiar el estado a 'EXPIRED' en la DB aquí directamente
      // invitation.status = 'EXPIRED';
      // await this.groupInvitationsRepository.saveInvitation(invitation);
      throw new BadRequestException('La invitación ha expirado.');
    }

    if (invitation.invited_user.id !== rejectingUserId) {
      throw new ForbiddenException(
        'No estás autorizado para rechazar esta invitación.',
      );
    }

    invitation.status = 'REJECTED';
    const updatedInvitation =
      await this.groupInvitationsRepository.saveInvitation(invitation);
    this.logger.log(
      `rejectInvitation(): Invitación ${invitation.id} rechazada por el usuario ${rejectingUserId}.`,
    );
    return plainToInstance(GroupInvitationDto, updatedInvitation);
  }

  /**
   * Permite al remitente cancelar una invitación pendiente.
   * @param invitationId El ID de la invitación a cancelar.
   * @param cancellingUserId El ID del usuario que cancela la invitación (debe coincidir con sender_id).
   * @returns El GroupInvitationDto actualizado.
   * @throws NotFoundException si no se encuentra la invitación.
   * @throws BadRequestException si la invitación no está pendiente.
   * @throws ForbiddenException si el usuario no es el remitente.
   */
  async cancelInvitation(
    invitationId: string,
    cancellingUserId: string,
  ): Promise<GroupInvitationDto> {
    const invitation =
      await this.groupInvitationsRepository.findOneById(invitationId);

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    if (invitation.status !== 'PENDING') {
      throw new BadRequestException(
        `La invitación no puede ser cancelada ya que su estado actual es ${invitation.status}. Solo las invitaciones PENDIENTES pueden ser canceladas.`,
      );
    }

    if (invitation.sender.id !== cancellingUserId) {
      throw new ForbiddenException(
        'No estás autorizado para cancelar esta invitación. Solo el remitente o un administrador pueden cancelar invitaciones.',
      );
    }

    invitation.status = 'CANCELED';
    const updatedInvitation =
      await this.groupInvitationsRepository.saveInvitation(invitation);
    this.logger.log(
      `cancelInvitation(): Invitación ${invitation.id} cancelada por el remitente ${cancellingUserId}.`,
    );
    return plainToInstance(GroupInvitationDto, updatedInvitation);
  }

  /**
   * Realiza un soft delete en una invitación a grupo, marcándola como eliminada lógicamente.
   * @param invitationId El ID de la invitación a soft-delete.
   * @param userId El ID del usuario que realiza la acción (para validación de permisos).
   * @throws NotFoundException si no se encuentra la invitación.
   * @throws ForbiddenException si el usuario no tiene permisos para eliminar (no es el remitente o un administrador).
   */
  async softDeleteInvitation(
    invitationId: string,
    userId: string,
  ): Promise<void> {
    this.logger.log(
      `softDeleteInvitation(): Intentando soft-eliminar invitación ${invitationId} por usuario ${userId}`,
    );
    const invitation =
      await this.groupInvitationsRepository.findOneById(invitationId);

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    // Solo el remitente de la invitación o un administrador/superadmin puede soft-eliminarla.
    const actingUser = await this.usersService.findUserEntityById(userId);
    if (!actingUser) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const isSender = invitation.sender_id === userId;
    const isAdminOrSuperAdmin =
      actingUser.role_name === 'ADMIN' || actingUser.role_name === 'SUPERADMIN';

    if (!isSender && !isAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta invitación. Solo el remitente o un administrador pueden hacerlo.',
      );
    }

    await this.groupInvitationsRepository.softDeleteInvitation(invitationId);
    this.logger.log(
      `softDeleteInvitation(): Invitación ${invitationId} soft-eliminada exitosamente.`,
    );
  }

  /**
   * Elimina una invitación a grupo permanentemente (hard delete). Úsalo con extrema precaución.
   * Este método debería ser solo para administradores o lógica de limpieza profunda.
   * @param invitationId El ID de la invitación a eliminar.
   * @throws NotFoundException si no se encuentra la invitación.
   */
  async hardDeleteInvitation(invitationId: string): Promise<void> {
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
      true,
    ); // Incluir soft-deleted para poder eliminar permanentemente
    if (!invitation) {
      throw new NotFoundException(
        `Invitación a grupo con ID "${invitationId}" no encontrada.`,
      );
    }
    const deleteResult =
      await this.groupInvitationsRepository.hardDeleteInvitation(invitationId);
    if (deleteResult.affected === 0) {
      this.logger.warn(
        `hardDeleteInvitation(): No se eliminaron registros para la invitación con ID "${invitationId}".`,
      );
    } else {
      this.logger.log(
        `hardDeleteInvitation(): Invitación ${invitationId} eliminada permanentemente.`,
      );
    }
  }

  /**
   * Procesa invitaciones pendientes que han expirado.
   * Este método es llamado por un cron job.
   */
  async handleExpiredInvitations(): Promise<void> {
    const now = new Date();
    this.logger.log(
      `handleExpiredInvitations(): Iniciando la verificación de invitaciones expiradas. Hora actual del servidor (UTC): ${now.toISOString()}`,
    );
    try {
      const expiredInvitations =
        await this.groupInvitationsRepository.findExpiredPendingInvitations();

      this.logger.log(
        `handleExpiredInvitations(): findExpiredPendingInvitations() encontró ${expiredInvitations.length} invitaciones.`,
      );

      if (expiredInvitations.length === 0) {
        this.logger.log(
          'handleExpiredInvitations(): No se encontraron invitaciones pendientes expiradas.',
        );
        return;
      }

      this.logger.log(
        `handleExpiredInvitations(): Procesando ${expiredInvitations.length} invitaciones para marcarlas como EXPIRED.`,
      );

      for (const invitation of expiredInvitations) {
        this.logger.debug(
          `handleExpiredInvitations(): Marcando como EXPIRED invitación ${invitation.id} (status: ${invitation.status}, expires_at: ${invitation.expires_at?.toISOString() || 'N/A'}). Hora actual: ${now.toISOString()}`,
        );

        invitation.status = 'EXPIRED';
        await this.groupInvitationsRepository.saveInvitation(invitation);
        this.logger.log(
          `handleExpiredInvitations(): Invitación ${invitation.id} marcada como EXPIRED. Expiró en: ${invitation.expires_at?.toISOString() || 'N/A'}.`,
        );
      }
      this.logger.log(
        `handleExpiredInvitations(): Se marcaron ${expiredInvitations.length} invitaciones como EXPIRED.`,
      );
    } catch (error) {
      this.logger.error(
        `handleExpiredInvitations(): Error al procesar invitaciones expiradas: ${(error as Error).message}`,
        (error as Error).stack,
      );
    }
  }

  /**
   * Recupera todas las invitaciones PENDIENTES para TODOS los usuarios.
   * Este método es usado principalmente por los cron jobs de recordatorios.
   * @returns Una lista de entidades GroupInvitation pendientes.
   */
  async findUserPendingInvitationsForAllUsers(): Promise<GroupInvitation[]> {
    this.logger.debug(
      'findUserPendingInvitationsForAllUsers(): Buscando todas las invitaciones pendientes para todos los usuarios.',
    );
    return this.groupInvitationsRepository.find({
      where: {
        status: 'PENDING',
        deleted_at: IsNull(), // Solo las que no han sido soft-deleted
        // Opcional: puedes añadir un filtro de expires_at si quieres recordar solo las que están cerca de expirar
        // expires_at: LessThanOrEqual(new Date(Date.now() + 24 * 60 * 60 * 1000)), // Recordar 24h antes de expirar
      },
      relations: ['group', 'sender', 'invited_user'], // Necesitas estos datos para el email
    });
  }
}
