// src/groups/groups.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from './entities/group.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';

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
   * Helper to create a query builder with common eager loads for Group and its relations.
   * This ensures that when a group is fetched, its leader and members (with their user details)
   * are also loaded, avoiding N+1 query problems.
   * @param alias The alias for the group entity in the query.
   * @returns A TypeORM QueryBuilder instance.
   */
  private createQueryBuilderWithRelations(alias = 'group') {
    return this.groupORMRepository
      .createQueryBuilder(alias)
      .leftJoinAndSelect('group.leader', 'leader') // Eager load the leader User entity
      .leftJoinAndSelect('group.members', 'members') // Eager load all GroupMember entities associated with this group
      .leftJoinAndSelect('members.user', 'memberUser'); // Eager load the User entity for each GroupMember
  }

  /**
   * Finds a single group by its ID, including its leader and members.
   * @param id The ID of the group to find.
   * @returns The Group entity or null if not found.
   */
  async findOneById(id: string): Promise<Group | null> {
    return this.createQueryBuilderWithRelations('group')
      .where('group.id = :id', { id })
      .getOne();
  }

  /**
   * Finds all groups a specific user is associated with (as leader or member).
   * This query checks both the 'leader' relationship and the 'group_members' relationship
   * to ensure all relevant groups are returned.
   * @param userId The ID of the user.
   * @returns A list of Group entities.
   */
  async findGroupsByUserId(userId: string): Promise<Group[]> {
    return this.createQueryBuilderWithRelations('group')
      .where('leader.id = :userId', { userId }) // Groups where the user is the direct leader
      .orWhere('members.user.id = :userId', { userId }) // Groups where the user is a member (could be leader or regular member via GroupMember)
      .getMany();
  }

  /**
   * Finds all groups with pagination, ordering, and optional filters.
   * Includes leader and member details for comprehensive data retrieval.
   * @param paginationOptions Pagination parameters (page, limit).
   * @param orderOptions Ordering parameters (sortBy, order).
   * @param filterName Optional filter by group name (case-insensitive LIKE search).
   * @param filterStatus Optional filter by group status.
   * @returns An object containing the list of Group entities and the total count.
   */
  async findAllPaginated(
    paginationOptions: PaginationDto,
    orderOptions: OrderDto,
    filterName?: string,
    filterStatus?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE',
  ): Promise<{ groups: Group[]; total: number }> {
    const { page, limit } = paginationOptions;
    const { sortBy, order } = orderOptions;

    const query = this.createQueryBuilderWithRelations('group'); // Already includes eager loads

    if (filterName) {
      query.andWhere('LOWER(group.name) LIKE LOWER(:filterName)', {
        filterName: `%${filterName}%`,
      });
    }
    if (filterStatus) {
      query.andWhere('group.status = :filterStatus', { filterStatus });
    }

    // Define valid sortable columns to prevent SQL injection or invalid column names
    const validSortColumns = {
      created_at: 'group.created_at',
      name: 'group.name',
      status: 'group.status',
      // Add other sortable columns if needed based on your application's requirements
    };

    const actualSortBy = validSortColumns[sortBy] || 'group.created_at'; // Default sort by creation date

    query.orderBy(actualSortBy, order);

    const [groups, total] = await query
      .skip((page - 1) * limit) // Apply pagination offset
      .take(limit) // Apply pagination limit
      .getManyAndCount(); // Execute query and get results with count

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
   * Deletes a group by its ID.
   * @param id The ID of the group to delete.
   */
  async deleteGroup(id: string): Promise<void> {
    await this.groupORMRepository.delete(id);
  }
}
