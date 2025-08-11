// src/groups/groups.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { Group } from './entities/group.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';

// Define the type for valid group statuses for clarity within this repository
type ValidGroupStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';

@Injectable()
export class GroupsRepository extends Repository<Group> {
  private readonly logger = new Logger(GroupsRepository.name);

  constructor(
    @InjectRepository(Group)
    private readonly groupORMRepository: Repository<Group>,
    private dataSource: DataSource,
  ) {
    super(Group, dataSource.createEntityManager());
  }

  /**
   * Helper para crear un query builder con cargas ansiosas comunes para Group y sus relaciones.
   * Esto asegura que cuando se busca un grupo, su líder y miembros (con sus detalles de usuario)
   * también se carguen, evitando problemas de consulta N+1.
   * @param alias El alias para la entidad Group en la consulta.
   * @param includeDeleted Si se deben incluir los grupos marcados como eliminados (soft-deleted).
   * @returns Una instancia de TypeORM QueryBuilder.
   */
  private createQueryBuilderWithRelations(
    alias = 'group',
    includeDeleted: boolean = false, // <-- Nuevo parámetro
  ) {
    const query = this.groupORMRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect('group.leader', 'leader') // Carga ansiosa de la entidad User del líder
      .leftJoinAndSelect('group.members', 'members') // Carga ansiosa de todas las entidades GroupMember
      .leftJoinAndSelect('members.user', 'memberUser'); // Carga ansiosa de los detalles del usuario miembro

    if (!includeDeleted) {
      // Por defecto, excluye grupos con deleted_at no nulo
      query.andWhere(`${alias}.deleted_at IS NULL`);
    }

    return query;
  }

  /**
   * Busca un grupo por su ID, con sus relaciones cargadas.
   * @param id El ID del grupo.
   * @param includeDeleted Si se debe incluir el grupo si está soft-deleted.
   * @returns La entidad Group o null si no se encuentra.
   */
  async findOneById(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<Group | null> {
    const query = this.createQueryBuilderWithRelations(
      'group',
      includeDeleted,
    ).where('group.id = :id', { id });
    return query.getOne();
  }

  /**
   * Finds a single group by its name (case-insensitive).
   * @param name The name of the group to find.
   * @returns The Group entity or null if not found.
   */
  async findOneByName(name: string): Promise<Group | null> {
    return this.groupORMRepository.findOne({
      where: { name: name },
      relations: ['leader', 'members', 'members.user'], // Eager load relations for completeness
    });
  }

  /**
   * Busca todos los grupos con paginación, ordenación y filtros opcionales.
   * @param paginationDto DTO para paginación (page, limit).
   * @param orderDto DTO para ordenación (sortBy, order).
   * @param filters Filtros adicionales (ej. name, status, leaderId).
   * @returns Un objeto que contiene la lista de grupos y el total.
   */
  async findAllPaginated(
    paginationDto: PaginationDto,
    orderDto: OrderDto,
    filters?: {
      name?: string;
      status?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';
      leaderId?: string;
      includeDeleted?: boolean; // Added for filtering by deleted_at
    },
  ): Promise<{ groups: Group[]; total: number }> {
    const { page, limit } = paginationDto;
    const { sortBy, order } = orderDto;

    const query = this.createQueryBuilderWithRelations(
      'group',
      filters?.includeDeleted, // Pass the includeDeleted filter to the query builder
    );

    // Apply optional filters
    if (filters?.name) {
      query.andWhere('LOWER(group.name) LIKE LOWER(:name)', {
        name: `%${filters.name}%`,
      });
    }
    if (filters?.status) {
      query.andWhere('group.status = :status', { status: filters.status });
    }
    if (filters?.leaderId) {
      query.andWhere('group.leader.id = :leaderId', {
        leaderId: filters.leaderId,
      });
    }
    // The includeDeleted filter is already handled in createQueryBuilderWithRelations

    // Define valid sort columns
    const validSortColumns = {
      name: 'group.name',
      status: 'group.status',
      created_at: 'group.created_at',
      date_time: 'group.date_time',
      // Add other sortable columns here if needed, following your application's requirements
    };

    const actualSortBy = validSortColumns[sortBy] || 'group.created_at'; // Default sort by creation date

    query.orderBy(actualSortBy, order); // Apply ordering

    const [groups, total] = await query
      .skip((page - 1) * limit) // Apply pagination offset
      .take(limit) // Apply pagination limit
      .getManyAndCount(); // Execute query and get results with total count

    return { groups, total };
  }

  /**
   * Saves a Group entity to the database. This method can be used for both creating new groups
   * and updating existing ones (if the entity has an ID).
   * @param group The Group entity to save.
   * @returns The saved Group entity (with updated properties like ID if newly created).
   */
  async saveGroup(group: Group): Promise<Group> {
    return this.groupORMRepository.save(group);
  }

  /**
   * Creates a new Group entity instance and saves it to the database.
   * This method is typically used for initial creation of a group.
   * @param groupPartial Partial Group entity data.
   * @returns The created Group entity.
   */
  async createGroup(groupPartial: Partial<Group>): Promise<Group> {
    const newGroup = this.groupORMRepository.create(groupPartial);
    return this.groupORMRepository.save(newGroup);
  }

  /**
   * Realiza un "soft delete" en un grupo, marcándolo como eliminado lógicamente.
   * Esto establece la columna `deleted_at` a la fecha y hora actuales,
   * y también puede establecer el `status` a 'DELETE'.
   * @param id El ID del grupo a desactivar.
   */
  async softDeleteGroup(id: string): Promise<void> {
    await this.groupORMRepository.update(
      { id },
      { deleted_at: new Date(), status: 'DELETE' }, // Mark deleted_at and update status
    );
    this.logger.log(
      `softDeleteGroup(): Group ${id} soft-deleted successfully.`,
    );
  }

  /**
   * Reactiva un grupo previamente soft-deleted.
   * Esto establece `deleted_at` a NULL y puede restaurar el `status` a 'ACTIVE'.
   * @param id El ID del grupo a reactivar.
   */
  async reactivateGroup(id: string): Promise<void> {
    await this.groupORMRepository.update(
      { id },
      { deleted_at: null, status: 'ACTIVE' }, // Clear deleted_at and restore status
    );
    this.logger.log(`reactivateGroup(): Grupo ${id} reactivated successfully.`);
  }

  /**
   * Elimina un grupo por su ID.
   * NOTA: Esto realiza un borrado físico. Úsalo con precaución.
   * La lógica de la API debe preferir softDeleteGroup.
   * @param id El ID del grupo a eliminar.
   */
  async hardDeleteGroup(id: string): Promise<void> {
    await this.groupORMRepository.delete(id);
    this.logger.log(`hardDeleteGroup(): Grupo ${id} physically deleted.`);
  }
}
