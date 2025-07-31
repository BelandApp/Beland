import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RolesRepository } from '../roles/roles.repository'; // Importación corregida
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/users.entity';
import { Role } from '../roles/entities/role.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { UserDto } from './dto/user.dto';
import { DataSource, Not } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';

// Constantes para los nombres de roles
const ROLE_USER = 'USER';
const ROLE_LEADER = 'LEADER';
const ROLE_ADMIN = 'ADMIN';
const ROLE_SUPERADMIN = 'SUPERADMIN';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.debug(
      `create(): Intentando crear usuario con email: ${createUserDto.email}`,
    );

    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException(
        `El email "${createUserDto.email}" ya está en uso.`,
      );
    }

    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Las contraseñas no coinciden.');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    let assignedRoleName: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' =
      ROLE_USER;
    if (createUserDto.role) {
      const validRoles: ('USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN')[] = [
        ROLE_USER,
        ROLE_LEADER,
        ROLE_ADMIN,
        ROLE_SUPERADMIN,
      ];
      if (!validRoles.includes(createUserDto.role)) {
        throw new BadRequestException(
          `El rol "${createUserDto.role}" no es válido.`,
        );
      }
      assignedRoleName = createUserDto.role;
    }

    const roleEntity = await this.rolesRepository.findByName(assignedRoleName);
    if (!roleEntity) {
      throw new InternalServerErrorException(
        `El rol "${assignedRoleName}" no fue encontrado en la base de datos.`,
      );
    }

    const newUser = this.usersRepository.create({
      oauth_provider: createUserDto.oauth_provider || null,
      email: createUserDto.email,
      username: createUserDto.username || null,
      full_name: createUserDto.full_name || null,
      profile_picture_url: createUserDto.profile_picture_url || null,
      current_balance: 0,
      role_name: assignedRoleName,
      role_id: roleEntity.role_id,
      address: createUserDto.address || null,
      phone: createUserDto.phone || null,
      country: createUserDto.country || null,
      city: createUserDto.city || null,
      isBlocked: createUserDto.isBlocked || false,
      deleted_at: createUserDto.deleted_at || null,
      password: hashedPassword,
      auth0_id: null,
    });

    const savedUser = await this.usersRepository.save(newUser);

    this.logger.log(
      `create(): Usuario con email "${savedUser.email}" y ID "${savedUser.id}" creado exitosamente.`,
    );
    return plainToInstance(UserDto, savedUser);
  }

  // Método para la creación del usuario inicial (SUPERADMIN) desde el seeder externo
  // ¡Este método debe retornar la entidad User, no UserDto!
  async createInitialUser(createUserDto: CreateUserDto): Promise<User> {
    this.logger.debug(
      `createInitialUser(): Procesando usuario inicial con email: ${createUserDto.email}.`,
    );

    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      this.logger.log(
        `createInitialUser(): Usuario "${createUserDto.email}" ya existe. Retornando usuario existente.`,
      );
      return existingUser; // Retornar la entidad User existente
    }

    const hashedPassword = createUserDto.password;

    let assignedRoleName: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' =
      ROLE_USER;
    if (createUserDto.role) {
      const validRoles: ('USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN')[] = [
        ROLE_USER,
        ROLE_LEADER,
        ROLE_ADMIN,
        ROLE_SUPERADMIN,
      ];
      if (!validRoles.includes(createUserDto.role)) {
        throw new BadRequestException(
          `El rol "${createUserDto.role}" no es válido.`,
        );
      }
      assignedRoleName = createUserDto.role;
    }

    const roleEntity = await this.rolesRepository.findByName(assignedRoleName);
    if (!roleEntity) {
      throw new InternalServerErrorException(
        `El rol "${assignedRoleName}" no fue encontrado en la base de datos.`,
      );
    }

    const newUser = this.usersRepository.create({
      oauth_provider: createUserDto.oauth_provider || null,
      email: createUserDto.email,
      username: createUserDto.username || null,
      full_name: createUserDto.full_name || null,
      profile_picture_url: createUserDto.profile_picture_url || null,
      current_balance: 0,
      role_name: assignedRoleName,
      role_id: roleEntity.role_id,
      address: createUserDto.address || null,
      phone: createUserDto.phone || null,
      country: createUserDto.country || null,
      city: createUserDto.city || null,
      isBlocked: createUserDto.isBlocked || false,
      deleted_at: createUserDto.deleted_at || null,
      password: hashedPassword,
      auth0_id: null,
    });

    const savedUser = await this.usersRepository.save(newUser);
    this.logger.log(
      `createInitialUser(): Nuevo usuario "${savedUser.email}" (ID: ${savedUser.id}) con rol "${assignedRoleName}" creado exitosamente.`,
    );
    return savedUser; // Retornar la entidad User creada
  }

  async findByEmail(email: string): Promise<UserDto> {
    this.logger.debug(`findByEmail(): Buscando usuario con email: ${email}.`);
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Usuario con email "${email}" no encontrado.`,
      );
    }
    return plainToInstance(UserDto, user);
  }

  async findAll(
    paginationOptions: PaginationDto,
    orderOptions: OrderDto,
    includeDeleted: boolean = false,
    filterId?: string,
    filterEmail?: string,
    filterRoleName?: string,
    filterIsBlocked?: boolean,
  ): Promise<{ users: UserDto[]; total: number }> {
    this.logger.debug(`findAll(): Buscando todos los usuarios.`);
    const { users, total } = await this.usersRepository.findAllPaginated(
      paginationOptions,
      orderOptions,
      includeDeleted,
      filterId,
      filterEmail,
      filterRoleName,
      filterIsBlocked,
    );
    this.logger.log(`findAll(): Encontrados ${total} usuarios.`);
    return { users: plainToInstance(UserDto, users), total };
  }

  async findDeactivatedUsers(): Promise<UserDto[]> {
    this.logger.debug(
      `findDeactivatedUsers(): Buscando usuarios desactivados.`,
    );
    const users = await this.usersRepository.findDeactivatedUsers();
    this.logger.log(
      `findDeactivatedUsers(): Encontrados ${users.length} usuarios desactivados.`,
    );
    return plainToInstance(UserDto, users);
  }

  async findOne(id: string, includeDeleted: boolean = false): Promise<UserDto> {
    this.logger.debug(`findOne(): Buscando usuario con ID: ${id}.`);
    const user = await this.usersRepository.findOne(id, includeDeleted);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    this.logger.log(`findOne(): Usuario ${id} encontrado.`);
    return plainToInstance(UserDto, user);
  }

  async updateMe(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    this.logger.debug(`updateMe(): Actualizando perfil del usuario ${id}.`);

    const existingUser = await this.usersRepository.findOne(id);
    if (!existingUser) {
      throw new NotFoundException(
        `Perfil de usuario con ID "${id}" no encontrado.`,
      );
    }

    const updateData: Partial<User> = {};
    if (updateUserDto.full_name !== undefined) {
      updateData.full_name = updateUserDto.full_name;
    }
    if (updateUserDto.profile_picture_url !== undefined) {
      updateData.profile_picture_url = updateUserDto.profile_picture_url;
    }
    if (updateUserDto.username !== undefined)
      updateData.username = updateUserDto.username;
    if (updateUserDto.address !== undefined)
      updateData.address = updateUserDto.address;
    if (updateUserDto.phone !== undefined)
      updateData.phone = updateUserDto.phone;
    if (updateUserDto.country !== undefined)
      updateData.country = updateUserDto.country;
    if (updateUserDto.city !== undefined) updateData.city = updateUserDto.city;

    if (
      updateUserDto.role !== undefined ||
      updateUserDto.isBlocked !== undefined ||
      updateUserDto.deleted_at !== undefined ||
      updateUserDto.email !== undefined ||
      updateUserDto.password !== undefined ||
      updateUserDto.confirmPassword !== undefined ||
      updateUserDto.oauth_provider !== undefined
    ) {
      throw new ForbiddenException(
        'No tienes permiso para modificar estos campos del perfil. Solo puedes actualizar tu nombre completo, foto de perfil, username, dirección, teléfono, país y ciudad.',
      );
    }

    const updateResult = await this.usersRepository.update(id, updateData);
    if (updateResult.affected === 0) {
      this.logger.warn(
        `updateMe(): No se pudo actualizar el perfil del usuario ${id} (posiblemente ningún cambio o usuario no encontrado).`,
      );
    }

    this.logger.log(`updateMe(): Perfil del usuario ${id} actualizado.`);
    const updatedUser = await this.usersRepository.findOne(id);
    return plainToInstance(UserDto, updatedUser);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    this.logger.debug(`update(): Actualizando usuario con ID: ${id}.`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await queryRunner.manager.findOne(User, {
        where: { id: id },
        relations: ['role_relation'],
        withDeleted: true,
      });

      if (!existingUser) {
        this.logger.warn(
          `update(): Usuario con ID "${id}" no encontrado para actualización transaccional.`,
        );
        throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
      }

      if (
        updateUserDto.email !== undefined &&
        updateUserDto.email !== existingUser.email
      ) {
        const existingUserWithEmail = await queryRunner.manager.findOne(User, {
          where: { email: updateUserDto.email, id: Not(id) },
        });
        if (existingUserWithEmail) {
          this.logger.warn(
            `update(): Conflicto: El email "${updateUserDto.email}" ya está en uso por otro usuario.`,
          );
          throw new ConflictException(
            `El email "${updateUserDto.email}" ya está en uso por otro usuario.`,
          );
        }
        existingUser.email = updateUserDto.email;
      }

      if (
        updateUserDto.role !== undefined &&
        updateUserDto.role !== existingUser.role_name
      ) {
        const newRoleEntity = await this.rolesRepository.findByName(
          updateUserDto.role,
        );
        if (!newRoleEntity) {
          throw new BadRequestException(
            `El rol "${updateUserDto.role}" no es válido.`,
          );
        }
        existingUser.role_name = newRoleEntity.name;
        existingUser.role_id = newRoleEntity.role_id;
      }

      if (updateUserDto.oauth_provider !== undefined)
        existingUser.oauth_provider = updateUserDto.oauth_provider;
      if (updateUserDto.username !== undefined)
        existingUser.username = updateUserDto.username;
      if (updateUserDto.full_name !== undefined)
        existingUser.full_name = updateUserDto.full_name;
      if (updateUserDto.profile_picture_url !== undefined)
        existingUser.profile_picture_url = updateUserDto.profile_picture_url;
      if (updateUserDto.address !== undefined)
        existingUser.address = updateUserDto.address;
      if (updateUserDto.phone !== undefined)
        existingUser.phone = updateUserDto.phone;
      if (updateUserDto.country !== undefined)
        existingUser.country = updateUserDto.country;
      if (updateUserDto.city !== undefined)
        existingUser.city = updateUserDto.city;
      if (updateUserDto.isBlocked !== undefined)
        existingUser.isBlocked = updateUserDto.isBlocked;
      if (updateUserDto.deleted_at !== undefined)
        existingUser.deleted_at = updateUserDto.deleted_at;

      await queryRunner.manager.save(existingUser);

      await queryRunner.commitTransaction();
      this.logger.log(
        `update(): Transacción de actualización de usuario ${id} completada exitosamente.`,
      );

      const finalUser = await this.usersRepository.findOne(id, true);
      return plainToInstance(UserDto, finalUser);
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `update(): Error durante la transacción de actualización de usuario ${id}: ${error.message}`,
        error.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update user due to an internal error.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateBlockStatus(id: string, isBlocked: boolean): Promise<UserDto> {
    this.logger.debug(
      `updateBlockStatus(): Actualizando estado de bloqueo para usuario con ID: ${id} a ${isBlocked}.`,
    );

    const user = await this.usersRepository.findOne(id, false);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    if (user.isBlocked === isBlocked) {
      throw new BadRequestException(
        `El usuario con ID "${id}" ya tiene el estado isBlocked en "${isBlocked}".`,
      );
    }

    await this.usersRepository.update(id, { isBlocked: isBlocked });

    const updatedUser = await this.usersRepository.findOne(id, false);
    if (!updatedUser) {
      this.logger.error(
        `updateBlockStatus(): No se pudo recuperar el usuario ${id} después de actualizar el estado de bloqueo.`,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve user after block status update.',
      );
    }

    this.logger.log(
      `updateBlockStatus(): Usuario ${id} ${isBlocked ? 'bloqueado' : 'desbloqueado'} exitosamente.`,
    );
    return plainToInstance(UserDto, updatedUser);
  }

  async softDeleteUser(id: string): Promise<void> {
    this.logger.debug(`softDeleteUser(): Desactivando usuario con ID: ${id}.`);
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    if (user.deleted_at !== null) {
      throw new BadRequestException(
        `El usuario con ID "${id}" ya está desactivado.`,
      );
    }

    await this.usersRepository.softDelete(id);
    this.logger.log(
      `softDeleteUser(): Usuario ${id} desactivado exitosamente.`,
    );
  }

  async reactivateUser(id: string): Promise<UserDto> {
    this.logger.debug(`reactivateUser(): Reactivando usuario con ID: ${id}.`);
    const user = await this.usersRepository.findOne(id, true);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    if (user.deleted_at === null) {
      throw new BadRequestException(
        `El usuario con ID "${id}" ya está activo.`,
      );
    }

    await this.usersRepository.reactivate(id);
    this.logger.log(`reactivateUser(): Usuario ${id} reactivado exitosamente.`);
    const reactivatedUser = await this.usersRepository.findOne(id, false);
    return plainToInstance(UserDto, reactivatedUser);
  }
}
