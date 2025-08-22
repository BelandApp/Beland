// src/group-members/group-members.service.ts
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
import { GroupMembersRepository } from './group-members.repository';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { GroupMemberDto } from './dto/group-member.dto';
import { UsersService } from 'src/users/users.service';
import { GroupsService } from 'src/groups/groups.service';
import { plainToInstance } from 'class-transformer';
import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/users/entities/users.entity';
import { GroupMember } from './entities/group-member.entity';
import { DataSource } from 'typeorm';
import { LessThanOrEqual, IsNull, Not } from 'typeorm';
import {
  GroupInvitation,
  GroupInvitationStatus,
} from 'src/group-invitations/entities/group-invitation.entity'; // Importar el enum también
import { GroupInvitationDto } from 'src/group-invitations/dto/group-invitation.dto';
import { GroupInvitationsService } from 'src/group-invitations/group-invitations.service';

@Injectable()
export class GroupMembersService {
  private readonly logger = new Logger(GroupMembersService.name);

  constructor(
    private readonly groupMembersRepository: GroupMembersRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => GroupsService))
    private readonly groupsService: GroupsService,
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => GroupInvitationsService))
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  /**
   * Crea una nueva membresía de grupo.
   * @param createGroupMemberDto Los datos para crear la membresía.
   * @returns La membresía de grupo creada.
   */
  async createGroupMember(
    createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `createGroupMember(): Creando membresía para groupId: ${createGroupMemberDto.group_id}, userId: ${createGroupMemberDto.user_id}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verificar si el usuario ya es miembro de este grupo
      const existingMembership =
        await this.groupMembersRepository.findOneByGroupAndUser(
          createGroupMemberDto.group_id,
          createGroupMemberDto.user_id,
        );

      if (existingMembership) {
        throw new ConflictException(
          'Este usuario ya es miembro de este grupo.',
        );
      }

      // 2. Verificar que el grupo y el usuario existen (Obtener ENTIDADES, no DTOs)
      const groupEntity = await queryRunner.manager.findOne(Group, {
        where: { id: createGroupMemberDto.group_id },
      });
      if (!groupEntity) {
        throw new NotFoundException(
          `Grupo con ID "${createGroupMemberDto.group_id}" no encontrado.`,
        );
      }

      const userEntity = await queryRunner.manager.findOne(User, {
        where: { id: createGroupMemberDto.user_id },
      });
      if (!userEntity) {
        throw new NotFoundException(
          `Usuario con ID "${createGroupMemberDto.user_id}" no encontrado.`,
        );
      }

      // 3. Crear la nueva entidad GroupMember (usando las entidades obtenidas)
      const newGroupMember = this.groupMembersRepository.create({
        group: groupEntity,
        user: userEntity,
        role: createGroupMemberDto.role || 'MEMBER',
      });

      // 4. Guardar la nueva membresía usando el queryRunner
      const savedMembership = await queryRunner.manager.save(newGroupMember);

      await queryRunner.commitTransaction();
      this.logger.log(
        `createGroupMember(): Membresía creada para el usuario ${createGroupMemberDto.user_id} en el grupo ${createGroupMemberDto.group_id}.`,
      );
      return plainToInstance(GroupMemberDto, savedMembership);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `createGroupMember(): Error durante la transacción de creación de membresía: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al crear la membresía del grupo debido a un error interno.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Encuentra una membresía de grupo por su ID.
   * @param id El ID de la membresía.
   * @returns La membresía encontrada.
   * @throws NotFoundException si la membresía no es encontrada.
   */
  async findOne(id: string): Promise<GroupMemberDto> {
    this.logger.debug(`findOne(): Buscando membresía de grupo con ID: ${id}`);
    const membership = await this.groupMembersRepository.findOneById(id);
    if (!membership) {
      throw new NotFoundException(
        `Membresía de grupo con ID "${id}" no encontrada.`,
      );
    }
    return plainToInstance(GroupMemberDto, membership);
  }

  /**
   * Obtiene todos los miembros de un grupo dado.
   * @param groupId El ID del grupo.
   * @returns Lista de GroupMemberDto.
   */
  async findAllByGroupId(groupId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `findAllByGroupId(): Obteniendo miembros para el grupo ID: ${groupId}`,
    );
    const members = await this.groupMembersRepository.findGroupMembersByGroupId(
      groupId,
    );
    return plainToInstance(GroupMemberDto, members);
  }

  /**
   * Actualiza una membresía de grupo existente.
   * @param id El ID de la membresía a actualizar.
   * @param updateGroupMemberDto Los datos de actualización.
   * @returns La membresía actualizada.
   */
  async updateGroupMember(
    id: string,
    updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `updateGroupMember(): Actualizando membresía de grupo ID: ${id}`,
    );
    const existingMembership = await this.groupMembersRepository.findOneById(
      id,
    );
    if (!existingMembership) {
      throw new NotFoundException(
        `Membresía de grupo con ID "${id}" no encontrada.`,
      );
    }

    Object.assign(existingMembership, updateGroupMemberDto);
    const updatedMembership = await this.groupMembersRepository.saveGroupMember(
      existingMembership,
    );

    this.logger.log(
      `updateGroupMember(): Membresía de grupo ${id} actualizada.`,
    );
    return plainToInstance(GroupMemberDto, updatedMembership);
  }

  /**
   * Elimina una membresía de grupo por su ID.
   * @param id El ID de la membresía a eliminar.
   */
  async deleteGroupMember(id: string): Promise<void> {
    this.logger.debug(
      `deleteGroupMember(): Eliminando membresía de grupo ID: ${id}`,
    );
    const result = await this.groupMembersRepository.deleteGroupMember(id);
    this.logger.log(`deleteGroupMember(): Membresía de grupo ${id} eliminada.`);
  }

  /**
   * Marca una invitación de grupo como aceptada y crea la membresía correspondiente.
   * @param invitationId El ID de la invitación de grupo.
   * @returns La nueva membresía creada.
   * @throws NotFoundException Si la invitación no se encuentra o ya está expirada/cancelada.
   * @throws ConflictException Si el usuario ya es miembro del grupo.
   * @throws BadRequestException Si la invitación ya fue aceptada.
   */
  async acceptInvitation(invitationId: string): Promise<GroupMemberDto> {
    this.logger.debug(
      `acceptInvitation(): Aceptando invitación con ID: ${invitationId}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const invitationEntity =
        await this.groupInvitationsService.findInvitationById(invitationId);

      if (!invitationEntity) {
        throw new NotFoundException(
          `Invitación con ID "${invitationId}" no encontrada.`,
        );
      }

      if (invitationEntity.status === GroupInvitationStatus.ACCEPTED) {
        throw new BadRequestException('Esta invitación ya ha sido aceptada.');
      }
      if (
        invitationEntity.status === GroupInvitationStatus.CANCELED ||
        invitationEntity.status === GroupInvitationStatus.EXPIRED ||
        invitationEntity.status === GroupInvitationStatus.REJECTED
      ) {
        throw new BadRequestException(
          `Esta invitación está ${invitationEntity.status.toLowerCase()}.`,
        );
      }

      const existingMembership =
        await this.groupMembersRepository.findOneByGroupAndUser(
          invitationEntity.group.id,
          invitationEntity.invited_user.id,
        );

      if (existingMembership) {
        throw new ConflictException(
          `El usuario ${invitationEntity.invited_user.email} ya es miembro del grupo ${invitationEntity.group.name}.`,
        );
      }

      const groupEntity = await queryRunner.manager.findOne(Group, {
        where: { id: invitationEntity.group.id },
      });
      const invitedUserEntity = await queryRunner.manager.findOne(User, {
        where: { id: invitationEntity.invited_user.id },
      });

      if (!groupEntity || !invitedUserEntity) {
        throw new InternalServerErrorException(
          'Error al obtener entidades de grupo o usuario para la membresía.',
        );
      }

      const newMembership = this.groupMembersRepository.create({
        group: groupEntity,
        user: invitedUserEntity,
        role: 'MEMBER',
      });

      const savedMembership = await queryRunner.manager.save(newMembership);

      // Eliminado: invitationEntity.accepted_at = new Date();
      invitationEntity.status = GroupInvitationStatus.ACCEPTED;

      await this.groupInvitationsService.saveInvitation(invitationEntity);

      await queryRunner.commitTransaction();
      this.logger.log(
        `acceptInvitation(): Invitación ${invitationId} aceptada. Usuario ${invitationEntity.invited_user.email} añadido al grupo ${invitationEntity.group.name}.`,
      );
      return plainToInstance(GroupMemberDto, savedMembership);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `acceptInvitation(): Error al aceptar la invitación ${invitationId}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
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
   * Comprueba si un usuario es miembro de un grupo.
   * @param groupId ID del grupo.
   * @param userId ID del usuario.
   * @returns True si es miembro, false en caso contrario.
   */
  async isUserMemberOfGroup(groupId: string, userId: string): Promise<boolean> {
    this.logger.debug(
      `isUserMemberOfGroup(): Checking if user ${userId} is member of group ${groupId}`,
    );
    const membership = await this.groupMembersRepository.findOneByGroupAndUser(
      groupId,
      userId,
    );
    return !!membership; // Retorna true si se encuentra la membresía, false si es null
  }
}
