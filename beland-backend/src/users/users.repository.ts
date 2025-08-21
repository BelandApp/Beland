import { Repository, Not, IsNull } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/users.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

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

  /**
   * Busca un usuario por su ID.
   * @param id El ID del usuario.
   * @param includeDeleted Si se deben incluir usuarios marcados como eliminados.
   * @returns La entidad User o null si no se encuentra.
   */
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

  async findById(id: string): Promise<User | null> {
    return this.userORMRepository.findOne({
      where: { id },
      relations: { wallet: true, cart: true, role_relation: true },
    });
  }

  /**
   * Busca un usuario por su Auth0 ID.
   * Es crucial para vincular las cuentas de Auth0 con las de tu base de datos.
   * @param auth0Id El ID de Auth0 del usuario.
   * @returns La entidad User o null si no se encuentra.
   */
  async findByAuth0Id(auth0Id: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .leftJoinAndSelect('user.admin', 'admin')
      .where('user.auth0_id = :auth0Id', { auth0Id })
      .getOne();
  }

  /**
   * Busca un usuario por su dirección de correo electrónico.
   * @param email La dirección de correo electrónico del usuario.
   * @returns La entidad User o null si no se encuentra.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userORMRepository.findOne({
      where: { email },
      relations: { wallet: true, cart: true, role_relation: true },
    });
  }

  /**
   * Busca un usuario por su nombre de usuario.
   * @param username El nombre de usuario.
   * @returns La entidad User o null si no se encuentra.
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .where('user.username = :username', { username })
      .getOne();
  }

  /**
   * Busca un usuario por su número de teléfono.
   * @param phone El número de teléfono.
   * @returns La entidad User o null si no se encuentra.
   */
  async findByPhone(phone: string): Promise<User | null> {
    // Cambiado a string
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .where('user.phone = :phone', { phone })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  /**
   * Crea una nueva instancia de la entidad User.
   * @param userPartial Datos parciales para crear el usuario.
   * @returns La nueva entidad User.
   */
  create(userPartial: Partial<User>): User {
    return this.userORMRepository.create(userPartial);
  }

  /**
   * Busca todos los usuarios con paginación, ordenación y filtros opcionales.
   * @param paginationOptions Opciones de paginación.
   * @param orderOptions Opciones de ordenación.
   * @param includeDeleted Si se deben incluir usuarios eliminados.
   * @param filterId ID para filtrar.
   * @param filterEmail Email para filtrar.
   * @param filterRoleName Nombre del rol para filtrar.
   * @param filterIsBlocked Estado de bloqueo para filtrar.
   * @returns Un objeto con la lista de usuarios y el total.
   */
  async findAllPaginated(
    getUsersQueryDto: GetUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    // CORRECCIÓN: Asegurarse de desestructurar todas las propiedades del DTO
    const {
      page,
      limit,
      sortBy,
      order,
      includeDeleted,
      id,
      email,
      roleName,
      isBlocked,
      username, // Añadido
      full_name, // Añadido
      oauth_provider, // Añadido
      phone, // Añadido
      country, // Añadido
      city, // Añadido
    } = getUsersQueryDto;

    const query = this.createQueryBuilder('user').leftJoinAndSelect(
      'user.role_relation',
      'role',
    );

    // Aplicar filtros dinámicamente
    if (id) {
      query.andWhere('user.id = :id', { id });
    }
    if (email) {
      query.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }
    if (username) {
      query.andWhere('user.username ILIKE :username', {
        username: `%${username}%`,
      });
    }
    if (full_name) {
      query.andWhere('user.full_name ILIKE :full_name', {
        full_name: `%${full_name}%`,
      });
    }
    if (oauth_provider) {
      query.andWhere('user.oauth_provider ILIKE :oauth_provider', {
        oauth_provider: `%${oauth_provider}%`,
      });
    }
    if (phone) {
      query.andWhere('user.phone = :phone', { phone });
    }
    if (country) {
      query.andWhere('user.country ILIKE :country', {
        country: `%${country}%`,
      });
    }
    if (city) {
      query.andWhere('user.city ILIKE :city', { city: `%${city}%` });
    }
    if (roleName) {
      query.andWhere('role.name = :roleName', { roleName });
    }
    if (typeof isBlocked === 'boolean') {
      query.andWhere('user.isBlocked = :isBlocked', { isBlocked });
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
      role: 'user.role_name',
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

  /**
   * Encuentra usuarios que han sido desactivados (soft-deleted).
   * @returns Una lista de entidades User desactivadas.
   */
  async findDeactivatedUsers(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .leftJoinAndSelect('user.role_relation', 'role')
      .where('user.deleted_at IS NOT NULL')
      .getMany();
  }

  /**
   * Guarda una entidad User en la base de datos.
   * @param user La entidad User a guardar.
   * @returns La entidad User guardada.
   */
  async save(user: User): Promise<User> {
    return this.userORMRepository.save(user);
  }

  /**
   * Actualiza parcialmente una entidad User por su ID.
   * @param id El ID del usuario a actualizar.
   * @param partialEntity Las propiedades parciales a actualizar.
   * @returns El resultado de la operación de actualización.
   */
  async update(id: string, partialEntity: Partial<User>): Promise<any> {
    return this.userORMRepository.update({ id }, partialEntity);
  }

  /**
   * Realiza un "soft delete" en un usuario, marcándolo como eliminado.
   * @param id El ID del usuario a desactivar.
   */
  async softDelete(id: string): Promise<void> {
    await this.userORMRepository.update({ id }, { deleted_at: new Date() });
  }

  /**
   * Reactiva un usuario previamente desactivado.
   * @param id El ID del usuario a reactivar.
   */
  async reactivate(id: string): Promise<void> {
    await this.userORMRepository.update({ id }, { deleted_at: null });
  }
}
