// src/group-members/group-members.repository.ts
import { Repository, Not, IsNull } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroupMember } from './entities/group-member.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { Group } from 'src/groups/entities/group.entity'; // Importar Group entity
import { User } from 'src/users/entities/users.entity'; // Importar User entity

@Injectable()
export class GroupMembersRepository {
  private readonly logger = new Logger(GroupMembersRepository.name);

  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMemberORMRepository: Repository<GroupMember>,
  ) {}

  /**
   * Helper para crear un query builder con cargas ansiosas profundas para GroupMember
   * y todas sus relaciones anidadas (grupo, líder del grupo, miembros del grupo, usuarios de miembros).
   * Esto es CRÍTICO para asegurar que los GroupDto se pueblen completamente.
   * @param alias El alias para la entidad GroupMember en la consulta.
   * @returns Una instancia de TypeORM QueryBuilder.
   */
  private createQueryBuilderWithRelations(alias = 'groupMember') {
    return this.groupMemberORMRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect('groupMember.group', 'group') // Carga ansiosa de la entidad Group
      .leftJoinAndSelect('group.leader', 'groupLeader') // Carga ansiosa del LÍDER del grupo
      .leftJoinAndSelect('group.members', 'groupMembers') // Carga ansiosa de los MIEMBROS del grupo
      .leftJoinAndSelect('groupMembers.user', 'groupMemberUser') // Carga ansiosa del USUARIO de cada miembro del grupo
      .leftJoinAndSelect('groupMember.user', 'user'); // Carga ansiosa de la entidad User de ESTA membresía
  }

  /**
   * Busca un miembro de grupo por su ID, con sus relaciones cargadas profundamente.
   * @param id El ID de la membresía de grupo.
   * @returns La entidad GroupMember o null si no se encuentra.
   */
  async findOneById(id: string): Promise<GroupMember | null> {
    return this.createQueryBuilderWithRelations()
      .where('groupMember.id = :id', { id })
      .getOne();
  }

  /**
   * Busca un solo miembro de grupo por ID de grupo y ID de usuario.
   * Incluye los detalles de usuario asociados para proporcionar información completa sobre el miembro.
   * Este método ahora utiliza el query builder con carga profunda.
   * @param groupId El ID del grupo.
   * @param userId El ID del usuario.
   * @returns La entidad GroupMember o null si no se encuentra.
   */
  async findOneByGroupAndUser(
    groupId: string,
    userId: string,
  ): Promise<GroupMember | null> {
    return this.createQueryBuilderWithRelations()
      .where('groupMember.group.id = :groupId', { groupId })
      .andWhere('groupMember.user.id = :userId', { userId })
      .getOne();
  }

  /**
   * Busca todos los miembros de un grupo específico, con sus relaciones cargadas profundamente.
   * @param groupId El ID del grupo.
   * @returns Una lista de entidades GroupMember.
   */
  async findGroupMembersByGroupId(groupId: string): Promise<GroupMember[]> {
    return this.createQueryBuilderWithRelations()
      .where('groupMember.group.id = :groupId', { groupId })
      .getMany();
  }

  /**
   * Busca todas las membresías de un usuario específico, con sus relaciones cargadas profundamente.
   * Este método ahora utiliza el query builder con carga profunda.
   * @param userId El ID del usuario.
   * @returns Una lista de entidades GroupMember.
   */
  async findByUserId(userId: string): Promise<GroupMember[]> {
    return this.createQueryBuilderWithRelations()
      .where('groupMember.user.id = :userId', { userId })
      .getMany();
  }

  /**
   * Guarda una entidad GroupMember en la base de datos. Este método se puede usar tanto para crear nuevos memberships
   * como para actualizar los existentes (ej., cambiando el rol de un miembro).
   * @param groupMember La entidad GroupMember a guardar.
   * @returns La entidad GroupMember guardada.
   */
  async saveGroupMember(groupMember: GroupMember): Promise<GroupMember> {
    return this.groupMemberORMRepository.save(groupMember);
  }

  /**
   * Crea una nueva instancia de la entidad GroupMember (NO la guarda en DB aquí).
   * La guarda la hará el EntityManager de la transacción o el método `saveGroupMember`.
   * @param groupPartial Datos parciales de la entidad GroupMember.
   * @returns La entidad GroupMember creada (no guardada aún).
   */
  create(groupMemberPartial: Partial<GroupMember>): GroupMember {
    return this.groupMemberORMRepository.create(groupMemberPartial);
  }

  /**
   * Actualiza parcialmente una entidad GroupMember por su ID.
   * @param id El ID del miembro del grupo a actualizar.
   * @param partialEntity Las propiedades parciales a actualizar.
   * @returns El resultado de la operación de actualización.
   */
  async update(id: string, partialEntity: Partial<GroupMember>): Promise<any> {
    return this.groupMemberORMRepository.update({ id }, partialEntity);
  }

  /**
   * Elimina una membresía de grupo por su ID (borrado físico).
   * @param id El ID de la membresía de grupo a eliminar.
   */
  async deleteGroupMember(id: string): Promise<void> {
    await this.groupMemberORMRepository.delete(id);
    this.logger.log(
      `deleteGroupMember(): Membresía de grupo ${id} eliminada físicamente.`,
    );
  }

  /**
   * Elimina una membresía de grupo por ID de grupo y ID de usuario.
   * @param groupId El ID del grupo.
   * @param userId El ID del usuario cuya membresía se va a eliminar.
   */
  async deleteGroupMemberByGroupAndUser(
    groupId: string,
    userId: string,
  ): Promise<void> {
    await this.groupMemberORMRepository.delete({
      group: { id: groupId },
      user: { id: userId },
    });
  }
}
