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
      .leftJoinAndSelect('members.user', 'memberUser'); // Eager load member user details
  }

  /**
   * Finds a single group by its ID, including its leader and members.
   * @param id The ID of the group to find.
   * @returns The Group entity or null if not found.
   */
  async findOneById(id: string): Promise<Group | null> {
    return this.createQueryBuilderWithRelations()
      .where('group.id = :id', { id })
      .getOne();
  }

  /**
   * Finds all groups with pagination, ordering, and optional filters.
   * Eagerly loads leader and members for comprehensive data retrieval.
   * @param page The page number to retrieve (1-based).
   * @param limit The maximum number of groups to return per page.
   * @param sortBy The column name to sort the results by (e.g., 'created_at', 'name', 'status').
   * @param order The sorting order, 'ASC' for ascending or 'DESC' for descending.
   * @param filterName Optional: A string to filter groups by their name (case-insensitive, partial match).
   * @param filterStatus Optional: A specific status to filter groups by ('ACTIVE', 'PENDING', 'INACTIVE', 'DELETE').
   * @returns A promise that resolves to an object containing an array of Group entities and the total count.
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'created_at',
    order: 'ASC' | 'DESC' = 'DESC',
    filterName?: string,
    filterStatus?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE',
  ): Promise<{ groups: Group[]; total: number }> {
    const query = this.createQueryBuilderWithRelations(); // Start with relations

    if (filterName) {
      query.andWhere('LOWER(group.name) LIKE LOWER(:filterName)', {
        filterName: `%${filterName}%`,
      });
    }
    if (filterStatus) {
      query.andWhere('group.status = :filterStatus', { filterStatus });
    }

    const validSortColumns = {
      created_at: 'group.created_at',
      name: 'group.name',
      status: 'group.status',
      // Add other sortable columns as needed based on your application's requirements
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
   * Note: This performs a hard delete. Ensure cascading is handled in TypeORM entities if needed.
   * @param id The ID of the group to delete.
   */
  async deleteGroup(id: string): Promise<void> {
    await this.groupORMRepository.delete(id);
  }
}
