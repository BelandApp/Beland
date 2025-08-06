import { Repository, Not } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';

// Definición de tipo para todos los roles válidos (debe coincidir con UsersService)
type ValidRoleNames = 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly userORMRepository: Repository<User>,
  ) {}

  private createQueryBuilder(alias = 'user') {
    return this.userORMRepository.createQueryBuilder(alias);
  }

  async getUserById(id: string): Promise<User> {
    return await this.userORMRepository.findOne({ 
      where: { id },
      relations: {role_relation:true, wallets:true}
    });
  }

  async getUserByEmail(email: string): Promise<User> {
    return await this.userORMRepository.findOne({ 
      where: { email },
      relations: {role_relation:true, wallets:true}
    });
  }

  async findOne(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<User | null> {
    const query = this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .where('user.id = :id', { id });

    if (!includeDeleted) {
      query.andWhere('user.deleted_at IS NULL');
    }

    return query.getOne();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .where('user.email = :email', { email })
      .getOne();
  }

  async create(userPartial: Partial<User>): Promise<User> {
    return await this.userORMRepository.save(userPartial);
  }

  async findAllPaginated(
    paginationOptions: PaginationDto,
    orderOptions: OrderDto,
    includeDeleted: boolean = false,
    filterId?: string,
    filterEmail?: string,
    filterRoleName?: ValidRoleNames,
    filterIsBlocked?: boolean,
  ): Promise<{ users: User[]; total: number }> {
    const { page, limit } = paginationOptions;
    const { sortBy, order } = orderOptions;

    const query = this.createQueryBuilder('user').leftJoinAndSelect(
      'user.role_relation',
      'role',
    );

    if (filterId) {
      query.andWhere('user.id = :filterId', { filterId });
    }
    if (filterEmail) {
      query.andWhere('user.email ILIKE :filterEmail', {
        filterEmail: `%${filterEmail}%`,
      });
    }
    if (filterRoleName) {
      query.andWhere('user.role_name = :filterRoleName', { filterRoleName });
    }
    if (filterIsBlocked !== undefined) {
      query.andWhere('user.isBlocked = :filterIsBlocked', { filterIsBlocked });
    }

    if (!includeDeleted) {
      query.andWhere('user.deleted_at IS NULL');
    }

    const validSortColumns = {
      created_at: 'user.created_at',
      updated_at: 'user.updated_at',
      email: 'user.email',
      username: 'user.username',
      full_name: 'user.full_name',
      role: 'user.role_name', // Asegúrate de que 'role' mapee a 'role_name'
      isBlocked: 'user.isBlocked',
    };

    const actualSortBy = validSortColumns[sortBy] || 'user.created_at';

    query.orderBy(actualSortBy, order);

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  async findDeactivatedUsers(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .where('user.deleted_at IS NOT NULL')
      .getMany();
  }

  async save(user: User): Promise<User> {
    return this.userORMRepository.save(user);
  }

  async update(id: string, partialEntity: Partial<User>): Promise<any> {
    return this.userORMRepository.update({ id }, partialEntity);
  }

  async softDelete(id: string): Promise<void> {
    await this.userORMRepository.update({ id }, { deleted_at: new Date() });
  }

  async reactivate(id: string): Promise<void> {
    await this.userORMRepository.update({ id }, { deleted_at: null });
  }
}
