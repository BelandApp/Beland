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
import {
  GroupInvitation,
  GroupInvitationStatus,
} from './entities/group-invitation.entity';
import { DataSource } from 'typeorm';
import { LessThanOrEqual, IsNull } from 'typeorm';

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
   * Crea una nueva invitación a grupo o reenvía una existente.
   * Implementa la lógica de negocio para fechas, estados y validaciones.
   *
   * @param createInvitationDto El DTO que contiene la información de la invitación.
   * Este DTO ahora espera solo `group_id`, y opcionalmente `email`, `username`, `phone`, `role`.
   * @param currentUserId El ID del usuario que está realizando la invitación (remitente).
   * @returns El DTO de la invitación creada o actualizada.
   * @throws NotFoundException si el grupo o el usuario invitado no se encuentran.
   * @throws ConflictException si ya existe una invitación activa o el usuario ya es miembro.
   * @throws ForbiddenException si el `currentUserId` no es líder del grupo.
   * @throws BadRequestException si no se proporciona ningún identificador para el invitado.
   */
  async createInvitation(
    createInvitationDto: CreateGroupInvitationDto,
    currentUserId: string,
  ): Promise<GroupInvitationDto> {
    // Desestructuramos el DTO para obtener solo los campos que se esperan del cliente.
    const { group_id, email, username, phone, role } = createInvitationDto;
    this.logger.debug(
      `createInvitation(): Intentando crear/reenviar invitación para grupo ${group_id} por ${currentUserId}. Datos de invitado recibidos: ${JSON.stringify(
        { email, username, phone },
      )}`,
    );

    // 1. Validar que el remitente es el líder del grupo o un admin.
    const group = await this.groupsService.findGroupById(group_id);
    if (!group) {
      throw new NotFoundException(`Grupo con ID "${group_id}" no encontrado.`);
    }

    const isSenderLeader = group.leader?.id === currentUserId;
    const isSenderAdmin = await this.usersService.isAdmin(currentUserId);

    if (!isSenderLeader && !isSenderAdmin) {
      throw new ForbiddenException(
        'Solo el líder del grupo o un administrador pueden enviar invitaciones para este grupo.',
      );
    }

    // 2. Identificar al usuario invitado: intenta encontrar un usuario existente por sus credenciales.
    let invitedUser: User | null = null;
    if (createInvitationDto.invited_user_id) {
      // Prioridad alta si se proporciona un ID de usuario directo
      try {
        invitedUser = await this.usersService.findUserEntityById(
          createInvitationDto.invited_user_id,
        );
      } catch (error) {
        // Si el ID no se encuentra, no es un error fatal aquí, simplemente no hay usuario existente por ID
        this.logger.debug(
          `Usuario con invited_user_id "${createInvitationDto.invited_user_id}" no encontrado. Intentando con otras credenciales.`,
        );
      }
    }

    if (!invitedUser && email) {
      try {
        invitedUser = await this.usersService.findUserEntityByEmail(email);
      } catch (error) {
        this.logger.debug(`Usuario con email "${email}" no encontrado.`);
      }
    }
    if (!invitedUser && username) {
      try {
        invitedUser = await this.usersService.findUserEntityByUsername(
          username,
        );
      } catch (error) {
        this.logger.debug(`Usuario con username "${username}" no encontrado.`);
      }
    }
    if (!invitedUser && phone) {
      try {
        invitedUser = await this.usersService.findUserEntityByPhone(phone);
      } catch (error) {
        this.logger.debug(`Usuario con teléfono "${phone}" no encontrado.`);
      }
    }

    // Si no se encontró ningún usuario existente y tampoco se proporcionaron credenciales, lanzar error.
    if (!invitedUser && !email && !username && !phone) {
      throw new BadRequestException(
        'Se debe proporcionar al menos un identificador (invited_user_id, email, username o phone) del usuario a invitar.',
      );
    }

    // 3. Verificar si el usuario ya es miembro del grupo (solo si se encontró un usuario existente)
    if (invitedUser) {
      const isMember = await this.groupMembersService.isUserMemberOfGroup(
        group_id,
        invitedUser.id,
      );
      if (isMember) {
        throw new ConflictException(
          `El usuario "${
            invitedUser.email || invitedUser.username || invitedUser.id
          }" ya es miembro del grupo "${group.name}".`,
        );
      }
    }

    // 4. Verificar invitaciones PENDIENTES existentes para evitar duplicados.
    // La búsqueda se hará por user_id si se encontró un usuario, o por email/phone/username si no es un usuario registrado.
    let existingInvitation: GroupInvitation | null = null;
    if (invitedUser?.id) {
      existingInvitation =
        await this.groupInvitationsRepository.findPendingInvitation(
          group_id,
          invitedUser.id,
        );
    } else {
      // Si no hay invitedUser (es una invitación a un NO-USUARIO registrado)
      // Buscamos por la combinación de grupo y una de las credenciales no-ID
      if (email) {
        existingInvitation = await this.groupInvitationsRepository.findOne({
          where: { group_id, email, status: GroupInvitationStatus.PENDING },
        });
      } else if (phone) {
        existingInvitation = await this.groupInvitationsRepository.findOne({
          where: { group_id, phone, status: GroupInvitationStatus.PENDING },
        });
      } else if (username) {
        existingInvitation = await this.groupInvitationsRepository.findOne({
          where: { group_id, username, status: GroupInvitationStatus.PENDING },
        });
      }
    }

    if (existingInvitation) {
      // Si ya existe una invitación PENDIENTE, la "reenviamos" actualizando la fecha de expiración.
      this.logger.log(
        `createInvitation(): Ya existe una invitación PENDIENTE para el usuario/grupo. Reenviando/Actualizando expiración.`,
      );
      // Calcula la nueva fecha de expiración
      const newExpiresAt = new Date();
      // Opción para testing: newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 1); // 1 minuto para pruebas
      newExpiresAt.setDate(newExpiresAt.getDate() + 3); // 3 días para producción

      existingInvitation.expires_at = newExpiresAt;
      existingInvitation.reminder_sent_at = null; // Resetear recordatorio
      const updatedInvitation =
        await this.groupInvitationsRepository.saveInvitation(
          existingInvitation,
        );
      return plainToInstance(GroupInvitationDto, updatedInvitation);
    }

    // 5. Crear nueva invitación si no existía una pendiente
    const newInvitation = this.groupInvitationsRepository.createInvitation({
      group_id: group_id,
      sender_id: currentUserId, // Obtenido del usuario autenticado
      invited_user_id: invitedUser?.id, // ID del usuario encontrado, o undefined
      email: invitedUser?.email || email, // Prioriza email de usuario encontrado, si no, el del DTO
      username: invitedUser?.username || username, // Prioriza username de usuario encontrado, si no, el del DTO
      phone: invitedUser?.phone
        ? String(invitedUser.phone)
        : phone
        ? String(phone)
        : undefined, // Prioriza phone de usuario encontrado, si no, el del DTO, y asegura que sea string
      role: role || 'MEMBER', // Rol por defecto 'MEMBER'
      status: GroupInvitationStatus.PENDING, // Siempre PENDING al crear
      // Calcula automáticamente la fecha de expiración
      expires_at: (function () {
        const expires = new Date();
        // Para pruebas: expires.setMinutes(expires.getMinutes() + 1); // Expira en 1 minuto
        expires.setDate(expires.getDate() + 3); // Expira en 3 días (producción)
        return expires;
      })(),
    });

    const savedInvitation =
      await this.groupInvitationsRepository.saveInvitation(newInvitation);
    this.logger.log(
      `createInvitation(): Nueva invitación creada con ID: ${savedInvitation.id} para grupo ${group_id}.`,
    );
    return plainToInstance(GroupInvitationDto, savedInvitation);
  }

  /**
   * Recupera una invitación a grupo específica por su ID.
   * @param invitationId El ID de la invitación.
   * @param includeSoftDeleted Si se deben incluir las invitaciones marcadas como eliminadas lógicamente.
   * @returns La entidad GroupInvitation.
   * @throws NotFoundException si no se encuentra la invitación.
   */
  async findInvitationById(
    invitationId: string,
    includeSoftDeleted: boolean = false,
  ): Promise<GroupInvitation> {
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
      includeSoftDeleted,
    );
    if (!invitation) {
      throw new NotFoundException(
        `Invitación a grupo con ID "${invitationId}" no encontrada.`,
      );
    }
    return invitation;
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
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
    );

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    if (invitation.status !== GroupInvitationStatus.PENDING) {
      throw new BadRequestException(
        `La invitación no está pendiente (estado actual: ${invitation.status}).`,
      );
    }

    // LÓGICA: Verificar si la invitación ha expirado
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      // Si la invitación está expirada, cámbiala a EXPIRED y lanza el error.
      invitation.status = GroupInvitationStatus.EXPIRED;
      await this.groupInvitationsRepository.saveInvitation(invitation);
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
      await this.groupMembersService.createGroupMember(createGroupMemberDto);

      invitation.status = GroupInvitationStatus.ACCEPTED;

      const updatedInvitation =
        await this.groupInvitationsRepository.saveInvitation(invitation);

      await queryRunner.commitTransaction();
      this.logger.log(
        `acceptInvitation(): Invitación ${invitation.id} aceptada por el usuario ${acceptingUserId}. Usuario agregado al grupo ${invitation.group.name}.`,
      );
      return plainToInstance(GroupInvitationDto, updatedInvitation);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `acceptInvitation(): Fallo al aceptar invitación ${invitation.id}: ${
          (error as Error).message
        }`,
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
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
    );

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    if (invitation.status !== GroupInvitationStatus.PENDING) {
      throw new BadRequestException(
        `La invitación no está pendiente (estado actual: ${invitation.status}).`,
      );
    }

    // LÓGICA: Verificar si la invitación ha expirado
    if (invitation.expires_at && invitation.expires_at < new Date()) {
      invitation.status = GroupInvitationStatus.EXPIRED;
      await this.groupInvitationsRepository.saveInvitation(invitation);
      throw new BadRequestException('La invitación ha expirado.');
    }

    if (invitation.invited_user.id !== rejectingUserId) {
      throw new ForbiddenException(
        'No estás autorizado para rechazar esta invitación.',
      );
    }

    invitation.status = GroupInvitationStatus.REJECTED;
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
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
    );

    if (!invitation) {
      throw new NotFoundException(
        `Invitación con ID "${invitationId}" no encontrada.`,
      );
    }

    if (invitation.status !== GroupInvitationStatus.PENDING) {
      throw new BadRequestException(
        `La invitación no puede ser cancelada ya que su estado actual es ${invitation.status}. Solo las invitaciones PENDIENTES pueden ser canceladas.`,
      );
    }

    if (invitation.sender.id !== cancellingUserId) {
      throw new ForbiddenException(
        'No estás autorizado para cancelar esta invitación. Solo el remitente o un administrador pueden hacerlo.',
      );
    }

    invitation.status = GroupInvitationStatus.CANCELED;
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
    const invitation = await this.groupInvitationsRepository.findOneById(
      invitationId,
    );

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
    );
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
        `hardDeleteInvitation(): Invitación ${invitation.id} eliminada permanentemente.`,
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
          `handleExpiredInvitations(): Marcando como EXPIRED invitación ${
            invitation.id
          } (status: ${invitation.status}, expires_at: ${
            invitation.expires_at?.toISOString() || 'N/A'
          }). Hora actual: ${now.toISOString()}`,
        );

        invitation.status = GroupInvitationStatus.EXPIRED;
        await this.groupInvitationsRepository.saveInvitation(invitation);
        this.logger.log(
          `handleExpiredInvitations(): Invitación ${
            invitation.id
          } marcada como EXPIRED. Expiró en: ${
            invitation.expires_at?.toISOString() || 'N/A'
          }.`,
        );
      }
      this.logger.log(
        `handleExpiredInvitations(): Se marcaron ${expiredInvitations.length} invitaciones como EXPIRED.`,
      );
    } catch (error) {
      this.logger.error(
        `handleExpiredInvitations(): Error al procesar invitaciones expiradas: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
    }
  }

  /**
   * Envía recordatorios para invitaciones pendientes que están cerca de expirar.
   * Este método es llamado por un cron job.
   */
  async sendInvitationReminders(): Promise<void> {
    const now = new Date();
    // Definimos un umbral para los recordatorios (ej. 15 minutos antes de expirar)
    const reminderThresholdMs = 15 * 60 * 1000; // 15 minutos en milisegundos
    const remindBefore = new Date(now.getTime() + reminderThresholdMs);

    this.logger.log(
      `sendInvitationReminders(): Iniciando el envío de recordatorios. Invitaciones que expiran antes de ${remindBefore.toISOString()} serán recordadas.`,
    );

    try {
      const invitationsToRemind = await this.groupInvitationsRepository.find({
        where: {
          status: GroupInvitationStatus.PENDING,
          expires_at: LessThanOrEqual(remindBefore),
          deleted_at: IsNull(),
        },
        relations: ['group', 'sender', 'invited_user'],
      });

      if (invitationsToRemind.length === 0) {
        this.logger.log(
          'sendInvitationReminders(): No se encontraron invitaciones para recordar.',
        );
        return;
      }

      this.logger.log(
        `sendInvitationReminders(): Encontradas ${invitationsToRemind.length} invitaciones para enviar recordatorio.`,
      );

      for (const invitation of invitationsToRemind) {
        this.logger.log(
          `sendInvitationReminders(): Enviando recordatorio para la invitación ${
            invitation.id
          } al usuario ${invitation.invited_user.email}. Expira en: ${
            invitation.expires_at?.toISOString() || 'N/A'
          }.`,
        );
        this.logger.log(
          `*** RECORDATORIO FICTICIO ***: Hola ${
            invitation.invited_user.full_name || invitation.invited_user.email
          }, tu invitación para unirte al grupo "${
            invitation.group.name
          }" expira pronto (${invitation.expires_at?.toLocaleString()}). ¡Acéptala ahora!`,
        );
        // Actualizar `reminder_sent_at` para no enviar múltiples recordatorios rápidamente
        invitation.reminder_sent_at = new Date();
        await this.groupInvitationsRepository.saveInvitation(invitation);
      }
      this.logger.log(
        'sendInvitationReminders(): Proceso de recordatorios finalizado.',
      );
    } catch (error) {
      this.logger.error(
        `sendInvitationReminders(): Error al enviar recordatorios: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
    }
  }

  /**
   * Guarda una entidad GroupInvitation en la base de datos.
   * Este método es crucial para que otros servicios puedan persistir cambios en las invitaciones.
   * @param invitation La entidad GroupInvitation a guardar.
   * @returns La entidad GroupInvitation guardada.
   */
  async saveInvitation(invitation: GroupInvitation): Promise<GroupInvitation> {
    return this.groupInvitationsRepository.saveInvitation(invitation);
  }
}
