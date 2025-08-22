// src/groups/groups.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { UsersService } from '../users/users.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupDto } from './dto/group.dto';
import { Group } from './entities/group.entity';
import { GroupMember } from '../group-members/entities/group-member.entity';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { CreateGroupMemberDto } from 'src/group-members/dto/create-group-member.dto';
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto';
import { UpdateGroupMemberDto } from 'src/group-members/dto/update-group-member.dto';
import { GetGroupsQueryDto } from './dto/get-groups-query.dto';
import { GroupInvitationsService } from 'src/group-invitations/group-invitations.service';
import { InviteUserDto } from 'src/group-members/dto/create-group-member.dto';
import { GroupInvitationDto } from 'src/group-invitations/dto/group-invitation.dto'; // Importar GroupInvitationDto
import { CreateGroupInvitationDto } from 'src/group-invitations/dto/create-group-invitation.dto'; // Importar CreateGroupInvitationDto para el tipo correcto

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMembersRepository: GroupMembersRepository,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => GroupInvitationsService))
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  /**
   * Crea un nuevo grupo y asigna al usuario que lo crea como líder y miembro.
   *
   * @param createGroupDto Los datos para crear el nuevo grupo.
   * @param leaderId El ID del usuario que será el líder del grupo.
   * @returns Una promesa que resuelve al grupo creado como un GroupDto.
   * @throws NotFoundException si el usuario líder no es encontrado.
   * @throws InternalServerErrorException si la transacción falla debido a un error interno.
   */
  async createGroup(
    createGroupDto: CreateGroupDto,
    leaderId: string,
  ): Promise<GroupDto> {
    this.logger.debug(
      `createGroup(): Intentando crear grupo para el líder ID: ${leaderId}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Encontrar al usuario que será el líder
      const leaderUserEntity: User = await queryRunner.manager.findOne(User, {
        where: { id: leaderId },
      });
      if (!leaderUserEntity) {
        throw new NotFoundException(
          `Usuario líder con ID "${leaderId}" no encontrado.`,
        );
      }

      // Verificar si ya existe un grupo con el mismo nombre (insensible a mayúsculas/minúsculas)
      const existingGroup = await this.groupsRepository.findOneByName(
        createGroupDto.name,
      );
      if (existingGroup) {
        throw new ConflictException(
          `Ya existe un grupo con el nombre "${createGroupDto.name}".`,
        );
      }

      // Crear la nueva entidad de grupo
      const newGroup = this.groupsRepository.create({
        ...createGroupDto,
        leader: leaderUserEntity, // Asignar la entidad del líder directamente
      });

      // Guardar el grupo dentro de la transacción
      const savedGroup = await queryRunner.manager.save(Group, newGroup);

      // Crear la membresía del grupo para el líder
      const leaderMembership = this.groupMembersRepository.create({
        group: savedGroup, // Asociar con el grupo recién creado
        user: leaderUserEntity, // Asociar con el usuario líder
        role: 'LEADER', // Establecer el rol como LÍDER
      });

      // Guardar la membresía del líder dentro de la transacción.
      await queryRunner.manager.save(GroupMember, leaderMembership);

      await queryRunner.commitTransaction();
      this.logger.log(
        `createGroup(): Grupo "${savedGroup.name}" (ID: ${savedGroup.id}) creado exitosamente por el líder ${leaderId}.`,
      );

      // Volver a buscar el grupo con todas las relaciones para el DTO completo
      const fullGroup = await this.groupsRepository.findOneById(savedGroup.id);
      return plainToInstance(GroupDto, fullGroup);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `createGroup(): Error durante la transacción de creación de grupo para el líder ID ${leaderId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error; // Re-lanzar excepciones conocidas
      }
      throw new InternalServerErrorException(
        'Fallo al crear el grupo debido a un error interno.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Recupera una lista paginada de todos los grupos, con opciones de filtrado y ordenación.
   * @param queryDto DTO que contiene los criterios de paginación, ordenación y filtro.
   * @returns Una promesa que resuelve a un objeto que contiene un array de GroupDto y el conteo total.
   * @throws InternalServerErrorException para errores inesperados.
   */
  async findAllGroups(
    queryDto: GetGroupsQueryDto,
  ): Promise<{ groups: GroupDto[]; total: number }> {
    this.logger.debug(
      `findAllGroups(): Obteniendo todos los grupos con consulta: ${JSON.stringify(
        queryDto,
      )}`,
    );
    try {
      const { groups, total } = await this.groupsRepository.findAllPaginated(
        { page: queryDto.page, limit: queryDto.limit },
        { sortBy: queryDto.sortBy, order: queryDto.order },
        {
          name: queryDto.name,
          status: queryDto.status,
          leaderId: queryDto.leaderId,
          includeDeleted: queryDto.includeDeleted,
        },
      );
      // Transformar entidades a DTOs para la respuesta
      const groupsDto = plainToInstance(GroupDto, groups);
      return { groups: groupsDto, total };
    } catch (error) {
      this.logger.error(
        `findAllGroups(): Error interno del servidor al obtener grupos: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al recuperar grupos debido a un error interno.',
      );
    }
  }

  /**
   * Encuentra un solo grupo por su ID, incluyendo su líder y miembros.
   * @param groupId El ID del grupo a encontrar.
   * @returns La entidad GroupDto o lanza NotFoundException si no es encontrado.
   * @throws NotFoundException si el grupo no es encontrado.
   */
  async findGroupById(groupId: string): Promise<GroupDto> {
    this.logger.debug(`findGroupById(): Buscando grupo con ID: ${groupId}`);
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      this.logger.warn(
        `findGroupById(): Grupo con ID "${groupId}" no encontrado.`,
      );
      throw new NotFoundException(`Grupo con ID "${groupId}" no encontrado.`);
    }
    // Transformar entidad a DTO para la respuesta
    return plainToInstance(GroupDto, group);
  }

  /**
   * Actualiza un grupo existente. Solo el líder del grupo o un ADMIN/SUPERADMIN puede actualizar.
   * @param groupId El ID del grupo a actualizar.
   * @param updateGroupDto Los datos parciales para actualizar el grupo.
   * @returns El grupo actualizado como un GroupDto.
   * @throws NotFoundException si el grupo no es encontrado.
   */
  async updateGroup(
    groupId: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDto> {
    this.logger.debug(`updateGroup(): Actualizando grupo con ID: ${groupId}`);
    const existingGroup = await this.groupsRepository.findOneById(groupId);
    if (!existingGroup) {
      throw new NotFoundException(`Grupo con ID "${groupId}" no encontrado.`);
    }

    // Aplicar actualizaciones parciales a la entidad de grupo existente
    Object.assign(existingGroup, updateGroupDto);
    const updatedGroup = await this.groupsRepository.saveGroup(existingGroup);
    this.logger.log(
      `updateGroup(): Grupo ${groupId} actualizado exitosamente.`,
    );
    return plainToInstance(GroupDto, updatedGroup);
  }

  /**
   * Elimina un grupo permanentemente. Solo el líder del grupo o un ADMIN/SUPERADMIN puede eliminar.
   * @param groupId El ID del grupo a eliminar.
   * @throws NotFoundException si el grupo no es encontrado.
   */
  async hardDeleteGroup(groupId: string): Promise<void> {
    this.logger.debug(`hardDeleteGroup(): Eliminando grupo con ID: ${groupId}`);
    const group = await this.groupsRepository.findOneById(groupId, true); // Incluir soft-deleted para verificar existencia
    if (!group) {
      throw new NotFoundException(`Grupo con ID "${groupId}" no encontrado.`);
    }
    const result = await this.groupsRepository.hardDeleteGroup(groupId); // Ahora devuelve DeleteResult
    if (result.affected === 0) {
      this.logger.warn(
        `hardDeleteGroup(): No se eliminaron registros para el grupo con ID "${groupId}".`,
      );
    } else {
      this.logger.log(
        `hardDeleteGroup(): Grupo ${groupId} eliminado permanentemente.`,
      );
    }
  }

  /**
   * Añade un usuario como miembro a un grupo basándose en un CreateGroupMemberDto.
   * Este método es llamado por el controlador después de resolver el usuario de un InviteUserDto.
   *
   * @param createGroupMemberDto El DTO que contiene group_id, user_id y rol opcional.
   * @returns El GroupMemberDto creado.
   * @throws NotFoundException si el grupo o el usuario invitado no son encontrados.
   * @throws BadRequestException si el usuario ya es miembro del grupo.
   * @throws InternalServerErrorException si la transacción falla.
   */
  async addGroupMember(
    createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `addGroupMember(): Añadiendo usuario ${createGroupMemberDto.user_id} al grupo ${createGroupMemberDto.group_id}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar la existencia del grupo y cargar ansiosamente los miembros con sus detalles de usuario
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: createGroupMemberDto.group_id },
        relations: ['members', 'leader', 'members.user'], // Cargar ansiosamente miembros y sus usuarios asociados
      });
      if (!group) {
        throw new NotFoundException(
          `Grupo con ID "${createGroupMemberDto.group_id}" no encontrado.`,
        );
      }

      // 2. Encontrar al usuario invitado
      const invitedUser: User | null = await queryRunner.manager.findOne(User, {
        where: { id: createGroupMemberDto.user_id },
      });

      if (!invitedUser) {
        throw new NotFoundException(
          'Usuario invitado no encontrado por las credenciales proporcionadas (user_id).',
        );
      }

      // 3. Verificar si el usuario ya es miembro
      const isAlreadyMember = group.members.some(
        (member) => member.user?.id === invitedUser.id, // Usar encadenamiento opcional para seguridad
      );

      if (isAlreadyMember) {
        throw new ConflictException(
          `El usuario "${invitedUser.email}" ya es miembro del grupo "${group.name}".`,
        );
      }

      // 4. Prevenir la asignación directa de un nuevo líder a través de este método, a menos que sea la creación inicial del grupo manejada por createGroup
      // Para promover a un miembro a líder, usa updateGroupMemberRole
      if (
        createGroupMemberDto.role === 'LEADER' &&
        group.leader !== null &&
        group.leader.id !== invitedUser.id
      ) {
        throw new BadRequestException(
          'No se puede añadir directamente un nuevo líder a un grupo existente a través de este método. Usa el endpoint de actualización de rol de miembro para promover a un miembro existente.',
        );
      }

      // 5. Crear la nueva membresía de grupo
      const newMembership = this.groupMembersRepository.create({
        group: group,
        user: invitedUser,
        role: createGroupMemberDto.role || 'MEMBER', // Usar el rol del DTO o predeterminar a MIEMBRO
      });

      // Guardar la nueva membresía usando el queryRunner.manager
      const savedMembership = await queryRunner.manager.save(
        GroupMember,
        newMembership,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `addGroupMember(): Usuario ${invitedUser.email} añadido al grupo ${group.name} exitosamente.`,
      );
      // Retornar la representación DTO de la nueva membresía, incluyendo relaciones pobladas
      return plainToInstance(GroupMemberDto, savedMembership, {
        enableCircularCheck: true,
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `addGroupMember(): Error durante la transacción de añadir miembro al grupo:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al añadir el usuario al grupo debido a un error interno.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Recupera todos los miembros de un grupo específico.
   * @param groupId El ID del grupo cuyos miembros se van a recuperar.
   * @returns Una promesa que resuelve a un array de GroupMemberDto.
   * @throws NotFoundException si el grupo no es encontrado.
   */
  async getGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `getGroupMembers(): Obteniendo miembros para el grupo ID: ${groupId}`,
    );
    const group = await this.groupsRepository.findOneById(groupId); // Asegurar que el grupo existe
    if (!group) {
      throw new NotFoundException(`Grupo con ID "${groupId}" no encontrado.`);
    }

    const members = await this.groupMembersRepository.findGroupMembersByGroupId(
      groupId,
    );
    return plainToInstance(GroupMemberDto, members);
  }

  /**
   * Recupera todos los grupos de los que un usuario específico es miembro.
   * @param userId El ID del usuario.
   * @returns Una promesa que resuelve a un array de GroupDto.
   * @throws NotFoundException si el usuario no es encontrado.
   */
  async getUserGroups(userId: string): Promise<GroupDto[]> {
    this.logger.debug(
      `getUserGroups(): Obteniendo grupos para el usuario ID: ${userId}`,
    );

    const user = await this.usersService.findUserEntityById(userId);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${userId}" no encontrado.`);
    }

    const memberships = await this.groupMembersRepository.findByUserId(userId); // CORREGIDO: Usar findByUserId
    const groups = memberships.map((membership) => membership.group);

    return plainToInstance(GroupDto, groups, {
      enableCircularCheck: true,
      excludeExtraneousValues: true,
    });
  }

  /**
   * Actualiza los detalles de un miembro de grupo existente (ej. rol).
   * @param memberId El ID de la membresía de grupo a actualizar.
   * @param updateGroupMemberDto Los datos parciales para actualizar la membresía.
   * @returns Una promesa que resuelve a la GroupMemberDto actualizada.
   * @throws NotFoundException si la membresía de grupo no es encontrada.
   * @throws BadRequestException si se violan reglas de negocio (ej. intentar asignar múltiples líderes).
   */
  async updateGroupMemberRole(
    memberId: string,
    updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `updateGroupMemberRole(): Actualizando miembro del grupo con ID: ${memberId} con datos: ${JSON.stringify(
        updateGroupMemberDto,
      )}`,
    );

    const existingMembership = await this.groupMembersRepository.findOneById(
      memberId,
    );

    if (!existingMembership) {
      throw new NotFoundException(
        `Miembro del grupo con ID "${memberId}" no encontrado.`,
      );
    }

    if (
      updateGroupMemberDto.role &&
      updateGroupMemberDto.role === 'LEADER' &&
      existingMembership.role !== 'LEADER'
    ) {
      const group = await this.groupsRepository.findOneById(
        existingMembership.group.id,
      );
      if (group) {
        const leaderMemberships = group.members.filter(
          (m) => m.role === 'LEADER' && m.id !== memberId,
        );
        if (leaderMemberships.length > 0) {
          throw new BadRequestException(
            'Un grupo solo puede tener un líder. Por favor, degrada al líder actual primero.',
          );
        }
      }
    }

    Object.assign(existingMembership, updateGroupMemberDto);

    const updatedMembership = await this.groupMembersRepository.saveGroupMember(
      existingMembership,
    );
    this.logger.log(
      `updateGroupMemberRole(): Miembro del grupo ${memberId} actualizado exitosamente.`,
    );
    return plainToInstance(GroupMemberDto, updatedMembership);
  }

  /**
   * Elimina un miembro de un grupo.
   * @param memberId El ID de la membresía del grupo a eliminar.
   * @returns Una promesa que se resuelve cuando la membresía es eliminada.
   * @throws NotFoundException si la membresía del grupo no es encontrada.
   * @throws BadRequestException si reglas de negocio específicas impiden la eliminación (ej. último líder).
   */
  async removeGroupMember(memberId: string): Promise<void> {
    this.logger.debug(
      `removeGroupMember(): Eliminando miembro del grupo con ID: ${memberId}`,
    );
    const groupMember = await this.groupMembersRepository.findOneById(memberId);

    if (!groupMember) {
      throw new NotFoundException(
        `Miembro del grupo con ID "${memberId}" no encontrado.`,
      );
    }

    if (groupMember.role === 'LEADER') {
      const group = await this.groupsRepository.findOneById(
        groupMember.group.id,
      );
      if (group) {
        const leaderMemberships = group.members.filter(
          (m) => m.role === 'LEADER' && m.id !== memberId,
        );
        if (leaderMemberships.length === 0) {
          throw new BadRequestException(
            'No se puede eliminar al último líder de un grupo activo. Por favor, asigna otro líder primero o elimina el grupo.',
          );
        }
      }
    }

    await this.groupMembersRepository.deleteGroupMember(memberId);
    this.logger.log(
      `removeGroupMember(): Miembro del grupo ${memberId} eliminado exitosamente.`,
    );
  }

  /**
   * Orquesta el proceso de invitar un usuario a un grupo.
   * Delega la lógica real de creación/reutilización de invitación al GroupInvitationsService.
   * @param groupId El ID del grupo.
   * @param inviteUserDto DTO con el email, username o teléfono del usuario a invitar.
   * @param currentUserId El ID del usuario que envía la invitación.
   * @returns El GroupInvitationDto creado o actualizado.
   */
  async inviteUserToGroup(
    groupId: string,
    inviteUserDto: InviteUserDto,
    currentUserId: string,
  ): Promise<GroupInvitationDto> {
    this.logger.debug(
      `inviteUserToGroup(): Orquestando invitación para grupo ${groupId} y usuario ${JSON.stringify(
        inviteUserDto,
      )} por ${currentUserId}`,
    );

    const createInvitationDto: CreateGroupInvitationDto = {
      // Especificar tipo para asegurar compatibilidad
      group_id: groupId,
      email: inviteUserDto.email,
      username: inviteUserDto.username,
      // Asegurarse de que 'phone' sea de tipo string en CreateGroupInvitationDto y GroupInvitation.
      // Si inviteUserDto.phone es un número y CreateGroupInvitationDto.phone es string, necesitarás
      // convertirlo: String(inviteUserDto.phone)
      phone: inviteUserDto.phone as string, // Realiza un type assertion aquí.
      role: inviteUserDto.role || 'MEMBER', // Asigna un rol predeterminado si no se proporciona
    };

    return await this.groupInvitationsService.createInvitation(
      createInvitationDto,
      currentUserId,
    );
  }
}
