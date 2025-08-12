// src/group-members/group-members.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
  forwardRef, // <-- Importar forwardRef
  Inject, // <-- Importar Inject
} from '@nestjs/common';
import { GroupMembersRepository } from './group-members.repository';
import { GroupsRepository } from 'src/groups/groups.repository';
import { UsersService } from '../users/users.service';
import { GroupMemberDto } from './dto/group-member.dto';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class GroupMembersService {
  private readonly logger = new Logger(GroupMembersService.name);

  constructor(
    private readonly groupMembersRepository: GroupMembersRepository,
    // Uso de @Inject y forwardRef para resolver la dependencia circular con GroupsModule
    @Inject(forwardRef(() => GroupsRepository))
    private readonly groupsRepository: GroupsRepository,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Crea una nueva membresía de grupo. Este método es principalmente para uso interno
   * (ej., por GroupsService cuando crea un grupo o invita a un usuario).
   * @param createGroupMemberDto Datos para crear la membresía.
   * @returns El GroupMemberDto de la nueva membresía.
   * @throws ConflictException si el usuario ya es miembro del grupo.
   */
  async create(
    createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `create(): Creando membresía de grupo para grupo ${createGroupMemberDto.group_id} y usuario ${createGroupMemberDto.user_id}`,
    );

    // Verificar si el usuario ya es miembro de este grupo
    const existingMembership =
      await this.groupMembersRepository.findOneByGroupAndUser(
        createGroupMemberDto.group_id,
        createGroupMemberDto.user_id,
      );
    if (existingMembership) {
      throw new ConflictException(
        `User ${createGroupMemberDto.user_id} is already a member of group ${createGroupMemberDto.group_id}.`,
      );
    }

    // Busca el grupo y el usuario para asegurar que existen y para asociarlos correctamente
    const group = await this.groupsRepository.findOneById(
      createGroupMemberDto.group_id,
    );
    if (!group) {
      throw new NotFoundException(
        `Group with ID "${createGroupMemberDto.group_id}" not found.`,
      );
    }

    const user = await this.usersService.findUserEntityById(
      createGroupMemberDto.user_id,
    );
    if (!user) {
      throw new NotFoundException(
        `User with ID "${createGroupMemberDto.user_id}" not found.`,
      );
    }

    // Crea y guarda la nueva membresía
    const newGroupMember = this.groupMembersRepository.create({
      group: group,
      user: user,
      role: createGroupMemberDto.role || 'MEMBER', // Por defecto 'MEMBER'
    });

    const savedGroupMember =
      await this.groupMembersRepository.saveGroupMember(newGroupMember);
    this.logger.log(`create(): Membresía creada: ${savedGroupMember.id}`);
    return plainToInstance(GroupMemberDto, savedGroupMember);
  }

  /**
   * Busca un miembro de grupo por su ID.
   * @param id El ID de la membresía del grupo.
   * @returns El GroupMemberDto o null si no se encuentra.
   */
  async findOne(id: string): Promise<GroupMemberDto | null> {
    this.logger.debug(`findOne(): Buscando miembro de grupo con ID: ${id}`);
    const groupMember = await this.groupMembersRepository.findOneById(id);
    if (!groupMember) {
      this.logger.warn(
        `findOne(): Miembro de grupo con ID "${id}" no encontrado.`,
      );
      return null;
    }
    return plainToInstance(GroupMemberDto, groupMember);
  }

  /**
   * Obtiene todos los miembros de un grupo específico.
   * @param groupId El ID del grupo.
   * @returns Una lista de GroupMemberDto.
   * @throws NotFoundException si el grupo no se encuentra.
   */
  async getGroupMembersByGroupId(groupId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `getGroupMembersByGroupId(): Obteniendo miembros para el grupo con ID: ${groupId}`,
    );
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }
    // Usa el nuevo método en el repositorio para obtener los miembros con sus relaciones
    const members = await this.groupMembersRepository.findByGroupId(groupId);
    return members.map((member) => plainToInstance(GroupMemberDto, member));
  }

  /**
   * Actualiza un miembro de grupo existente.
   * @param id El ID de la membresía del grupo a actualizar.
   * @param updateGroupMemberDto Los datos de actualización para la membresía.
   * @returns El GroupMemberDto actualizado.
   * @throws NotFoundException si la membresía no se encuentra.
   * @throws BadRequestException si hay un problema con la actualización del rol de líder.
   */
  async update(
    id: string,
    updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(`update(): Actualizando miembro de grupo con ID: ${id}`);
    const existingMembership =
      await this.groupMembersRepository.findOneById(id);
    if (!existingMembership) {
      throw new NotFoundException(`Group member with ID "${id}" not found.`);
    }

    // Lógica para asignar LEADER: asegurar que solo hay un líder o manejar la transferencia.
    if (
      updateGroupMemberDto.role === 'LEADER' &&
      existingMembership.role !== 'LEADER'
    ) {
      const group = await this.groupsRepository.findOneById(
        existingMembership.group.id,
      );
      if (group) {
        const currentLeaderMembership = group.members.find(
          (m) => m.role === 'LEADER' && m.id !== id,
        );
        if (currentLeaderMembership) {
          // Si ya hay un líder, lo degradamos a 'MEMBER'
          await this.groupMembersRepository.saveGroupMember({
            ...currentLeaderMembership,
            role: 'MEMBER',
          });
          this.logger.log(
            `Degradado el líder anterior ${currentLeaderMembership.user.email} a MEMBER.`,
          );
        }
      }
    }

    // Aplica las actualizaciones
    Object.assign(existingMembership, updateGroupMemberDto);
    const updatedMembership =
      await this.groupMembersRepository.saveGroupMember(existingMembership);
    this.logger.log(
      `update(): Miembro de grupo ${id} actualizado exitosamente.`,
    );
    return plainToInstance(GroupMemberDto, updatedMembership);
  }

  /**
   * Elimina una membresía de grupo.
   * @param id El ID de la membresía a eliminar.
   * @throws NotFoundException si la membresía no se encuentra.
   * @throws BadRequestException si se intenta eliminar el último LEADER de un grupo activo.
   */
  async remove(id: string): Promise<void> {
    this.logger.debug(`remove(): Eliminando miembro de grupo con ID: ${id}`);
    const groupMember = await this.groupMembersRepository.findOneById(id); // Obtiene la membresía para verificar el rol y el grupo
    if (!groupMember) {
      throw new NotFoundException(`Group member with ID "${id}" not found.`);
    }

    // Regla especial: Prevenir la eliminación del último LEADER de un grupo si el grupo está activo.
    if (groupMember.role === 'LEADER') {
      const group = await this.groupsRepository.findOneById(
        groupMember.group.id,
      );
      if (group && group.status !== 'DELETE') {
        // Solo si el grupo no está soft-deleted
        // Filtra para encontrar otros líderes en el grupo (excluyendo el que se está eliminando)
        const leaderMemberships = group.members.filter(
          (m) => m.role === 'LEADER' && m.id !== id,
        );
        if (leaderMemberships.length === 0) {
          throw new BadRequestException(
            'Cannot remove the last leader of an active group. Please assign another leader first or delete the group.',
          );
        }
      }
    }

    await this.groupMembersRepository.deleteGroupMember(id); // Realiza el borrado físico de la membresía
    this.logger.log(
      `remove(): Membresía de grupo ${id} eliminada exitosamente.`,
    );
  }

  /**
   * Busca todas las membresías de grupo para un usuario específico.
   * @param userId El ID del usuario.
   * @returns Una lista de GroupMemberDto.
   */
  async findUserGroupMemberships(userId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `findUserGroupMemberships(): Buscando membresías para el usuario con ID: ${userId}`,
    );
    const memberships = await this.groupMembersRepository.findByUserId(userId);
    return memberships.map((member) => plainToInstance(GroupMemberDto, member));
  }
}
