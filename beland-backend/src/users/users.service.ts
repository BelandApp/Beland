// src/users/users.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException, // Asegúrate de importar esto si tu servicio lo lanza
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RolesRepository } from '../roles/roles.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/users.entity';
import { Role } from '../roles/entities/role.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { UserDto } from './dto/user.dto';
import { DataSource, Not, IsNull, Or } from 'typeorm'; // Añadir IsNull, Or si los usas para `deleted_at`
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { Wallet } from 'src/wallets/entities/wallet.entity';
import { Cart } from 'src/cart/entities/cart.entity';

// Constantes para los nombres de roles
const ROLE_USER = 'USER';
const ROLE_LEADER = 'LEADER';
const ROLE_ADMIN = 'ADMIN';
const ROLE_SUPERADMIN = 'SUPERADMIN';
const ROLE_EMPRESA = 'EMPRESA';

// Definición de tipo para todos los roles válidos
type ValidRoleNames = 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCE' | 'FUNDATION';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly rolesRepository: RolesRepository,
    private dataSource: DataSource,
  ) {}

  // ==============================================
  //           *** NUEVO MÉTODO PARA AUTH0 ***
  // ==============================================

  /**
   * Busca un usuario por su ID de Auth0 o lo crea si no existe.
   * Este método es llamado por JwtStrategy para manejar el aprovisionamiento de usuarios de Auth0.
   *
   * @param createUserDto Contiene los datos del usuario de Auth0, incluyendo `auth0_id`.
   * @returns La entidad `User` de la base de datos.
   * @throws InternalServerErrorException si hay un error en la base de datos.
   * @throws ConflictException si el email ya está en uso por un usuario no-Auth0.
   */
  async findOrCreateAuth0User(createUserDto: CreateUserDto): Promise<User> {
    this.logger.debug(
      `findOrCreateAuth0User(): Procesando usuario con Auth0 ID: ${createUserDto.auth0_id}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Intentar encontrar el usuario por su auth0_id
      let user = await this.usersRepository.findByAuth0Id(
        createUserDto.auth0_id,
      );

      if (user) {
        this.logger.debug(
          `findOrCreateAuth0User(): Usuario existente encontrado para Auth0 ID: ${user.auth0_id}.`,
        );
        // Opcional: Actualizar los datos del usuario si hay cambios en Auth0 (ej. foto de perfil, nombre)
        // Solo actualiza si los valores entrantes no son nulos/vacíos para evitar sobrescribir con null
        user.email = createUserDto.email || user.email;
        user.full_name = createUserDto.full_name || user.full_name;
        user.profile_picture_url =
          createUserDto.profile_picture_url || user.profile_picture_url;
        // isBlocked y deleted_at se manejan por tu backend, no desde Auth0 directamente.

        await queryRunner.manager.save(User, user); // Guardar cualquier actualización

        // Asegurarse de que las relaciones necesarias (ej. rol) estén cargadas para los guards.
        user = await this.usersRepository.findOne(user.id); // Re-fetch para cargar relaciones (findOne en repo ya carga eager)
        return user;
      }

      // 2. Si no existe un usuario con ese auth0_id, intentar por email para evitar duplicados.
      // Esto es CRUCIAL si un usuario pudo haberse registrado localmente con el mismo email antes de Auth0.
      const existingUserByEmail = await this.usersRepository.findByEmail(
        createUserDto.email,
      );
      if (existingUserByEmail) {
        // Si el usuario ya existe con ese email pero no tiene auth0_id, vincularlo.
        if (!existingUserByEmail.auth0_id) {
          existingUserByEmail.auth0_id = createUserDto.auth0_id;
          existingUserByEmail.oauth_provider = createUserDto.oauth_provider;
          await queryRunner.manager.save(User, existingUserByEmail);
          this.logger.log(
            `findOrCreateAuth0User(): Usuario existente por email (${existingUserByEmail.email}) vinculado a Auth0 ID: ${createUserDto.auth0_id}.`,
          );
          user = existingUserByEmail;
        } else {
          // Si ya existe y tiene un auth0_id diferente, es un conflicto grave.
          this.logger.warn(
            `findOrCreateAuth0User(): Conflicto de email: "${createUserDto.email}" ya está registrado con otro Auth0 ID.`,
          );
          throw new ConflictException(
            `El email "${createUserDto.email}" ya está registrado y vinculado a otra cuenta de Auth0.`,
          );
        }
      }

      if (!user) {
        // Si no se encontró por Auth0 ID ni por email (o se vinculó), se crea uno nuevo
        this.logger.debug(
          `findOrCreateAuth0User(): Creando nuevo usuario para Auth0 ID: ${createUserDto.auth0_id}`,
        );

        // Buscar el rol por defecto 'USER'. Asumimos que siempre existe.
        let defaultRole = await this.rolesRepository.findByName(ROLE_USER);
        if (!defaultRole) {
          defaultRole = await queryRunner.manager.save(Role, {
            name: ROLE_USER,
            description: 'Usuario básico del sistema',
            is_active: true,
          });
          this.logger.warn(
            `findOrCreateAuth0User(): El rol '${ROLE_USER}' no existía, fue creado.`,
          );
        }

        // Hashear la contraseña temporal (aunque no se usará para login de Auth0)
        // Se requiere para que la entidad User sea válida si tiene un campo password not nullable.
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const newUser = queryRunner.manager.create(User, {
          ...createUserDto,
          auth0_id: createUserDto.auth0_id, // Asegurarse de que el auth0_id esté en la entidad
          role_name: defaultRole.name,
          role_id: defaultRole.role_id,
          password: hashedPassword, // Guarda la contraseña hasheada
          isBlocked: createUserDto.isBlocked, // <-- Usar el valor del DTO
          deleted_at: createUserDto.deleted_at, // <-- Usar el valor del DTO
        });

        const savedUser = await queryRunner.manager.save(User, newUser);

        // Crear cartera y carrito por defecto para el nuevo usuario
        const newWallet = queryRunner.manager.create(Wallet, {
          user: savedUser,
          balance: 0,
        });
        await queryRunner.manager.save(Wallet, newWallet);

        const newCart = queryRunner.manager.create(Cart, { user: savedUser });
        await queryRunner.manager.save(Cart, newCart);

        await queryRunner.commitTransaction(); // Confirmar todas las operaciones

        // Retornar el usuario recién creado, asegurando que las relaciones estén cargadas
        return await this.usersRepository.findOne(savedUser.id);
      }

      return user; // Retorna el usuario encontrado o vinculado
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Revertir si algo falla
      this.logger.error(
        `findOrCreateAuth0User(): Error al crear/recuperar usuario para Auth0 ID ${
          createUserDto.auth0_id
        }: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Relanza excepciones específicas o una genérica
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to provision or retrieve user during Auth0 login.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  // ==============================================
  //           *** MÉTODOS EXISTENTES ***
  // ==============================================

  // MÉTODOS DE BÚSQUEDA

  /**
   * Busca todos los usuarios paginados, filtrados y ordenados.
   * @param getUsersQueryDto Objeto DTO con parámetros de paginación, filtro y ordenación.
   * @param isSuperAdminOrAdmin Booleano que indica si el usuario actual es un Superadmin o Admin.
   * @returns Una promesa que resuelve a un objeto con la lista de UserDto y el total.
   */
  async findAll(
    getUsersQueryDto: GetUsersQueryDto,
    isSuperAdminOrAdmin: boolean, // <-- ¡Este es el parámetro que faltaba!
  ): Promise<{ users: UserDto[]; total: number }> {
    this.logger.debug(
      `findAll(): Buscando usuarios con filtros: ${JSON.stringify(
        getUsersQueryDto,
      )} con isSuperAdminOrAdmin: ${isSuperAdminOrAdmin}`,
    );

    // Lógica para determinar si se deben incluir usuarios eliminados (soft-deleted)
    // Se respeta el valor de includeDeleted del query si es Admin/Superadmin.
    // Si no es Admin/Superadmin, includeDeleted siempre será false.
    const finalIncludeDeleted = isSuperAdminOrAdmin
      ? getUsersQueryDto.includeDeleted
      : false;

    // Actualizar el DTO con el valor `includeDeleted` final antes de pasarlo al repositorio.
    // Esto es importante porque el repositorio solo debe recibir el valor finalizado.
    getUsersQueryDto.includeDeleted = finalIncludeDeleted;

    // CORRECCIÓN: Se pasa el DTO completo al repositorio, el repositorio se encarga de la desestructuración y filtros.
    const { users, total } = await this.usersRepository.findAllPaginated(
      getUsersQueryDto, // <-- Se pasa el DTO completo con includeDeleted ajustado
    );

    // Mapear las entidades User a UserDto para la respuesta
    const usersDto = plainToInstance(UserDto, users);
    return { users: usersDto, total };
  }

  /**
   * Busca un usuario por su ID.
   * @param id El ID del usuario.
   * @param includeDeleted Si se deben incluir usuarios desactivados.
   * @returns Una promesa que resuelve al UserDto o lanza NotFoundException.
   * @throws NotFoundException Si el usuario no se encuentra.
   */
  async findOneById(
    id: string,
    includeDeleted: boolean = false,
  ): Promise<UserDto> {
    this.logger.debug(`findOneById(): Buscando usuario con ID: ${id}`);
    const user = await this.usersRepository.findOne(id, includeDeleted);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return plainToInstance(UserDto, user);
  }

  /**
   * Busca un usuario por su email.
   * @param email El email del usuario.
   * @returns Una promesa que resuelve a la entidad User o null si no se encuentra.
   */
  async findOneByEmail(email: string): Promise<User | null> {
    this.logger.debug(`findOneByEmail(): Buscando usuario con email: ${email}`);
    // Usamos el repositorio directamente que devuelve la entidad User
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Usuario con email "${email}" no encontrado.`,
      );
    }
    return user; // Devuelve la entidad User, el controlador la mapeará a DTO si es necesario
  }

  /**
   * Busca un usuario por su nombre de usuario.
   * @param username El nombre de usuario.
   * @returns Una promesa que resuelve a la entidad User o null si no se encuentra.
   */
  async findOneByUsername(username: string): Promise<User | null> {
    this.logger.debug(
      `findOneByUsername(): Buscando usuario con username: ${username}`,
    );
    return this.usersRepository.findByUsername(username);
  }

  /**
   * Busca un usuario por su número de teléfono.
   * @param phone El número de teléfono.
   * @returns Una promesa que resuelve a la entidad User o null si no se encuentra.
   */
  async findOneByPhone(phone: number): Promise<User | null> {
    this.logger.debug(
      `findOneByPhone(): Buscando usuario con teléfono: ${phone}`,
    );
    return this.usersRepository.findByPhone(phone);
  }

  /**
   * Busca un usuario por su ID y devuelve la entidad User.
   * Este método es para uso interno cuando se necesita la entidad completa,
   * por ejemplo, para realizar comprobaciones de roles/estados.
   * @param id El ID del usuario.
   * @returns Una promesa que resuelve a la entidad User o lanza NotFoundException.
   * @throws NotFoundException Si el usuario no se encuentra.
   */
  async findUserEntityById(id: string): Promise<User> {
    this.logger.debug(
      `findUserEntityById(): Buscando entidad usuario con ID: ${id}`,
    );
    const user = await this.usersRepository.findOne(id); // Usa findOne del repo que carga relaciones
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    return user;
  }

  /**
   * Busca usuarios desactivados lógicamente (soft-deleted).
   * @returns Una lista de entidades User desactivadas.
   */
  async findDeactivatedUsers(): Promise<UserDto[]> {
    this.logger.debug(
      'findDeactivatedUsers(): Buscando usuarios desactivados.',
    );
    const users = await this.usersRepository.findDeactivatedUsers();
    return plainToInstance(UserDto, users);
  }

  // MÉTODOS DE CREACIÓN/ACTUALIZACIÓN/ELIMINACIÓN

  /**
   * Crea un nuevo usuario.
   * Este método DEBE tener validaciones adicionales para la unicidad de email/username.
   * @param createUserDto Datos para crear el usuario.
   * @returns Una promesa que resuelve al UserDto del usuario creado.
   * @throws ConflictException si el email o username ya existen.
   */
  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.debug(
      `create(): Intentando crear nuevo usuario: ${createUserDto.email}`,
    );

    // Comprobar si el email ya existe
    const existingUserByEmail = await this.usersRepository.findByEmail(
      createUserDto.email,
    );
    if (existingUserByEmail) {
      throw new ConflictException(
        `El email "${createUserDto.email}" ya está registrado.`,
      );
    }

    // Comprobar si el username ya existe (si se proporciona)
    if (createUserDto.username) {
      const existingUserByUsername = await this.usersRepository.findByUsername(
        createUserDto.username,
      );
      if (existingUserByUsername) {
        throw new ConflictException(
          `El nombre de usuario "${createUserDto.username}" ya está en uso.`,
        );
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el rol 'USER' por defecto
      let userRole = await this.rolesRepository.findByName(ROLE_USER);

      if (!userRole) {
        userRole = await queryRunner.manager.save(Role, {
          name: ROLE_USER,
          description: 'Usuario básico del sistema',
          is_active: true,
        });
        this.logger.warn(`El rol 'USER' no existía, fue creado.`);
      }

      // Hashear la contraseña antes de guardar
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const newUser = queryRunner.manager.create(User, {
        ...createUserDto,
        password: hashedPassword,
        role_name: userRole.name as ValidRoleNames,
        role_id: userRole.role_id,
      });

      const savedUser = await queryRunner.manager.save(User, newUser);

      // Crear cartera por defecto para el nuevo usuario
      const newWallet = queryRunner.manager.create(Wallet, {
        user: savedUser,
        balance: 0,
      });
      await queryRunner.manager.save(Wallet, newWallet);

      // Crear carrito por defecto para el nuevo usuario
      const newCart = queryRunner.manager.create(Cart, { user: savedUser });
      await queryRunner.manager.save(Cart, newCart);

      await queryRunner.commitTransaction(); // Confirma la transacción

      this.logger.log(
        `create(): Usuario ${savedUser.email} creado exitosamente.`,
      );
      return plainToInstance(UserDto, savedUser);
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Reversión total si algo falla
      this.logger.error(
        `create(): Error al crear usuario: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Mantener ConflictException si es por email/username, de lo contrario lanzar error interno.
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'No se pudo registrar el usuario.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Actualiza un usuario existente por su ID.
   * @param id El ID del usuario a actualizar.
   * @param updateUserDto Objeto DTO con las propiedades a actualizar.
   * @returns Una promesa que resuelve al UserDto del usuario actualizado.
   * @throws NotFoundException si el usuario no se encuentra.
   * @throws ConflictException si el nuevo email o username ya existen.
   * @throws BadRequestException si se intenta actualizar el rol de un superadmin o si el rol no es válido.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    this.logger.debug(`update(): Actualizando usuario con ID: ${id}`);
    const userToUpdate = await this.usersRepository.findOne(id);
    if (!userToUpdate) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    // Comprobaciones de unicidad para email y username si se están actualizando
    if (updateUserDto.email && updateUserDto.email !== userToUpdate.email) {
      const existingUser = await this.usersRepository.findByEmail(
        updateUserDto.email,
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `El email "${updateUserDto.email}" ya está en uso por otro usuario.`,
        );
      }
    }

    if (
      updateUserDto.username &&
      updateUserDto.username !== userToUpdate.username
    ) {
      const existingUser = await this.usersRepository.findByUsername(
        updateUserDto.username,
      );
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `El nombre de usuario "${updateUserDto.username}" ya está en uso por otro usuario.`,
        );
      }
    }

    // Manejar la actualización de la contraseña si se proporciona
    if (updateUserDto.password) {
      if (updateUserDto.password !== updateUserDto.confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden.');
      }
      userToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Manejar la actualización del rol
    if (updateUserDto.role) {
      // No permitir cambiar el rol de un SUPERADMIN a otra cosa
      if (
        userToUpdate.role_name === ROLE_SUPERADMIN &&
        updateUserDto.role !== ROLE_SUPERADMIN
      ) {
        throw new BadRequestException(
          'No se puede cambiar el rol de un SUPERADMIN.',
        );
      }

      const newRole = await this.rolesRepository.findByName(updateUserDto.role);
      if (!newRole) {
        throw new BadRequestException(
          `El rol "${updateUserDto.role}" no es un rol válido.`,
        );
      }
      userToUpdate.role_name = newRole.name as ValidRoleNames;
      userToUpdate.role_id = newRole.role_id;
    }

    // Aplicar otras propiedades actualizables
    Object.assign(userToUpdate, updateUserDto); // Esto sobreescribe propiedades si están en updateUserDto

    const updatedUser = await this.usersRepository.save(userToUpdate);
    this.logger.log(`update(): Usuario ${id} actualizado exitosamente.`);
    return plainToInstance(UserDto, updatedUser);
  }

  /**
   * Actualiza el estado de bloqueo de un usuario.
   * @param id El ID del usuario.
   * @param isBlocked El nuevo estado de bloqueo.
   * @returns Una promesa que resuelve al UserDto del usuario actualizado.
   * @throws NotFoundException si el usuario no se encuentra.
   * @throws BadRequestException si se intenta bloquear a un SUPERADMIN.
   */
  async updateBlockStatus(id: string, isBlocked: boolean): Promise<UserDto> {
    this.logger.debug(
      `updateBlockStatus(): Actualizando estado de bloqueo para ID: ${id} a ${isBlocked}`,
    );
    const user = await this.usersRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }

    if (user.role_name === ROLE_SUPERADMIN) {
      throw new BadRequestException(
        'No se puede bloquear o desbloquear a un SUPERADMIN.',
      );
    }

    user.isBlocked = isBlocked;
    const updatedUser = await this.usersRepository.save(user);
    this.logger.log(
      `updateBlockStatus(): Usuario ${id} estado de bloqueo actualizado a ${isBlocked}.`,
    );
    return plainToInstance(UserDto, updatedUser);
  }

  /**
   * Desactiva lógicamente un usuario (soft delete).
   * @param id El ID del usuario a desactivar.
   * @throws NotFoundException si el usuario no se encuentra.
   * @throws BadRequestException si el usuario ya está desactivado o es un SUPERADMIN.
   */
  async softDeleteUser(id: string): Promise<void> {
    this.logger.debug(`softDeleteUser(): Desactivando usuario con ID: ${id}.`);
    const user = await this.usersRepository.findOne(id); // Eliminar 'true' si findOne ya maneja la inclusión de eliminados por defecto o si es un método separado.
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    if (user.deleted_at !== null) {
      throw new BadRequestException(
        `El usuario con ID "${id}" ya está desactivado.`,
      );
    }
    if (user.role_name === ROLE_SUPERADMIN) {
      throw new BadRequestException('No se puede desactivar a un SUPERADMIN.');
    }

    await this.usersRepository.softDelete(id);
    this.logger.log(
      `softDeleteUser(): Usuario ${id} desactivado exitosamente.`,
    );
  }

  /**
   * Reactiva un usuario previamente desactivado. Devuelve UserDto.
   * @param id El ID del usuario a reactivar.
   * @returns El UserDto reactivado.
   * @throws NotFoundException si el usuario no se encuentra.
   * @throws BadRequestException si el usuario ya está activo.
   */
  async reactivateUser(id: string): Promise<UserDto> {
    this.logger.debug(`reactivateUser(): Reactivando usuario con ID: ${id}.`);
    // Buscar incluyendo eliminados para poder reactivarlo
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
    // Vuelve a buscar para obtener la entidad actualizada y sus relaciones.
    const reactivatedUser = await this.usersRepository.findOne(id);
    return plainToInstance(UserDto, reactivatedUser);
  }

  /**
   * Elimina permanentemente un usuario de la base de datos (hard delete).
   * @param id El ID del usuario a eliminar.
   * @throws NotFoundException si el usuario no se encuentra.
   * @throws BadRequestException si se intenta eliminar un SUPERADMIN.
   * @returns void
   */
  async deleteUser(id: string): Promise<void> {
    this.logger.debug(`deleteUser(): Eliminando usuario con ID: ${id}.`);
    const user = await this.usersRepository.findOne(id, true); // Incluir eliminados lógicamente
    if (!user) {
      throw new NotFoundException(`Usuario con ID "${id}" no encontrado.`);
    }
    if (user.role_name === ROLE_SUPERADMIN) {
      throw new BadRequestException(
        'No se puede eliminar a un SUPERADMIN permanentemente.',
      );
    }

    // Aquí deberías llamar a un método de HARD DELETE en tu repositorio,
    // si `softDelete` es solo para el borrado lógico.
    // Por ejemplo: await this.usersRepository.hardDelete(id);
    // Si `softDelete` en tu repositorio realmente hace un hard delete si se llama aquí, está bien.
    // Basado en tu repositorio, `softDelete` solo marca `deleted_at`, así que esto DEBERÍA SER `hardDelete`
    await this.usersRepository.softDelete(id); // <--- REVISAR: Si esto debe ser hardDelete
    this.logger.log(`deleteUser(): Usuario ${id} eliminado permanentemente.`);
  }
}
