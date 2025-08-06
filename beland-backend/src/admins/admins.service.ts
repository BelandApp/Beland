// src/admins/admins.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Inject,
  forwardRef,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UsersService } from '../users/users.service';
import { AdminRepository } from './admins.repository';
import { QueryRunner, DeleteResult, Repository, Not } from 'typeorm';
import { RolesRepository } from '../roles/roles.repository';
import { User } from '../users/entities/users.entity';
import { plainToInstance } from 'class-transformer';

// Definición de tipo para todos los roles válidos
type ValidRoleNames = 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly adminRepository: AdminRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async create(
    createAdminDto: CreateAdminDto,
    existingQueryRunner?: QueryRunner,
  ): Promise<Admin> {
    this.logger.debug(
      `create(): Intentando crear admin para user_id: ${createAdminDto.user_id}`,
    );

    const manager = existingQueryRunner
      ? existingQueryRunner.manager
      : this.adminRepository.manager;
    const adminRepo = manager.getRepository(Admin);
    const userRepo = manager.getRepository(User);

    // Buscar usuario por su ID (PK)
    const userEntity = await userRepo.findOne({
      where: { id: createAdminDto.user_id }, // Usar 'id' en lugar de 'auth0_id'
      withDeleted: false,
    });

    if (!userEntity) {
      this.logger.warn(
        `create(): Usuario con ID "${createAdminDto.user_id}" no encontrado o inactivo. No se puede hacer admin.`,
      );
      throw new BadRequestException(
        `Active user with ID "${createAdminDto.user_id}" not found or is not active. Cannot make admin.`,
      );
    }

    const existingAdmin = await adminRepo.findOne({
      where: { user_id: createAdminDto.user_id },
    });

    if (existingAdmin) {
      this.logger.warn(
        `create(): Usuario con ID "${createAdminDto.user_id}" ya es un admin.`,
      );
      throw new ConflictException(
        `User with ID "${createAdminDto.user_id}" is already an admin.`,
      );
    }

    // Corrección: rolesRepository.findByName espera 1 argumento (el nombre)
    const adminRole = await this.rolesRepository.findByName(
      'ADMIN' as ValidRoleNames,
    );
    if (!adminRole) {
      this.logger.error(
        `create(): Rol 'ADMIN' no encontrado en la base de datos.`,
      );
      throw new InternalServerErrorException(
        'Admin role not found in the database. Please ensure it exists and has a UUID.',
      );
    }

    let ownQueryRunner: QueryRunner | undefined;
    if (!existingQueryRunner) {
      ownQueryRunner =
        this.adminRepository.manager.connection.createQueryRunner();
      await ownQueryRunner.connect();
      await ownQueryRunner.startTransaction();
    }
    const currentManager = ownQueryRunner ? ownQueryRunner.manager : manager;
    const currentAdminRepo = currentManager.getRepository(Admin);
    const currentUserRepo = currentManager.getRepository(User);

    try {
      const adminEntity = currentAdminRepo.create({
        user: userEntity,
        user_id: userEntity.id, // Asignar el ID (PK) del usuario
        content_permission: createAdminDto.content_permission,
        user_permission: createAdminDto.user_permission,
        moderation_permission: createAdminDto.moderation_permission,
        finance_permission: createAdminDto.finance_permission,
        analytics_permission: createAdminDto.analytics_permission,
        settings_permission: createAdminDto.settings_permission,
        leader_management_permission:
          createAdminDto.leader_management_permission,
        company_management_permission:
          createAdminDto.company_management_permission,
      });

      const savedAdmin = await currentAdminRepo.save(adminEntity);
      this.logger.log(
        `create(): Entrada de admin creada para user_id: ${createAdminDto.user_id}`,
      );

      await currentUserRepo.update(
        { id: userEntity.id },
        { role_id: adminRole.role_id, role_name: adminRole.name },
      );
      this.logger.log(
        `create(): Rol de usuario ${userEntity.email} actualizado a '${adminRole.name}'.`,
      );

      const finalAdmin = await currentManager.getRepository(Admin).findOne({
        where: { admin_id: savedAdmin.admin_id },
        relations: ['user'],
      });

      if (!finalAdmin) {
        throw new InternalServerErrorException(
          'Failed to retrieve created admin after save.',
        );
      }

      if (ownQueryRunner) {
        await ownQueryRunner.commitTransaction();
        this.logger.log(
          `create(): Transacción completada exitosamente para user_id: ${createAdminDto.user_id}`,
        );
      }

      return finalAdmin;
    } catch (error: unknown) {
      if (ownQueryRunner) {
        await ownQueryRunner.rollbackTransaction();
      }
      this.logger.error(
        `create(): Error durante la transacción de creación de admin para user_id ${createAdminDto.user_id}:`,
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error.stack : undefined,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create admin due to an internal error.',
      );
    } finally {
      if (ownQueryRunner) {
        await ownQueryRunner.release();
      }
    }
  }

  async createOrUpdateAdminEntry(
    userId: string, // Este userId ahora es el ID (PK) de la tabla User
    permissions: Partial<Admin>,
    existingQueryRunner?: QueryRunner,
  ): Promise<Admin> {
    this.logger.debug(
      `createOrUpdateAdminEntry(): Procesando entrada de admin para user_id (PK): ${userId}`,
    );

    const manager = existingQueryRunner
      ? existingQueryRunner.manager
      : this.adminRepository.manager;
    const adminRepo = manager.getRepository(Admin);
    const userRepo = manager.getRepository(User);

    // Buscar usuario por su ID (PK)
    const userEntity = await userRepo.findOne({
      where: { id: userId }, // Usar 'id' en lugar de 'auth0_id'
      withDeleted: true,
    });
    if (!userEntity) {
      this.logger.warn(
        `createOrUpdateAdminEntry(): Usuario con ID "${userId}" no encontrado para operación de admin.`,
      );
      throw new NotFoundException(
        `User with ID "${userId}" not found for admin operation.`,
      );
    }

    let adminEntry = await adminRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (adminEntry) {
      this.logger.log(
        `createOrUpdateAdminEntry(): Actualizando permisos para admin existente con user_id: ${userId}`,
      );
      Object.assign(adminEntry, permissions);
      return adminRepo.save(adminEntry);
    } else {
      this.logger.log(
        `createOrUpdateAdminEntry(): Creando nueva entrada de admin para user_id: ${userId}`,
      );
      const adminEntity = adminRepo.create({
        user: userEntity,
        user_id: userEntity.id, // Asignar el ID (PK) del usuario
        content_permission: permissions.content_permission,
        user_permission: permissions.user_permission,
        moderation_permission: permissions.moderation_permission,
        finance_permission: permissions.finance_permission,
        analytics_permission: permissions.analytics_permission,
        settings_permission: permissions.settings_permission,
        leader_management_permission: permissions.leader_management_permission,
        company_management_permission:
          permissions.company_management_permission,
      });
      return adminRepo.save(adminEntity);
    }
  }

  async deleteAdminEntry(
    userId: string, // Este userId ahora es el ID (PK) de la tabla User
    existingQueryRunner?: QueryRunner,
  ): Promise<void> {
    this.logger.debug(
      `deleteAdminEntry(): Eliminando entrada de admin para user_id (PK): ${userId}`,
    );

    const manager = existingQueryRunner
      ? existingQueryRunner.manager
      : this.adminRepository.manager;
    const adminRepo = manager.getRepository(Admin);

    const adminEntry = await adminRepo.findOne({
      where: { user_id: userId },
    });
    if (!adminEntry) {
      this.logger.warn(
        `deleteAdminEntry(): No se encontró entrada de admin para user_id: ${userId}. No se eliminó nada.`,
      );
      return;
    }

    let ownQueryRunner: QueryRunner | undefined;
    if (!existingQueryRunner) {
      ownQueryRunner =
        this.adminRepository.manager.connection.createQueryRunner();
      await ownQueryRunner.connect();
      await ownQueryRunner.startTransaction();
    }
    const currentAdminRepo = ownQueryRunner
      ? ownQueryRunner.manager.getRepository(Admin)
      : adminRepo;

    try {
      await currentAdminRepo.delete({ user_id: userId });
      this.logger.log(
        `deleteAdminEntry(): Entrada de admin eliminada para user_id: ${userId}.`,
      );

      if (ownQueryRunner) {
        await ownQueryRunner.commitTransaction();
        this.logger.log(
          `deleteAdminEntry(): Transacción de eliminación de admin completada para user_id: ${userId}.`,
        );
      }
    } catch (error: unknown) {
      if (ownQueryRunner) {
        await ownQueryRunner.rollbackTransaction();
      }
      this.logger.error(
        `deleteAdminEntry(): Error durante la transacción de eliminación de admin para user_id ${userId}:`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw new InternalServerErrorException('Failed to remove admin entry.');
    } finally {
      if (ownQueryRunner) {
        await ownQueryRunner.release();
      }
    }
  }

  async findAll(): Promise<Admin[]> {
    this.logger.debug('findAll(): Buscando todos los administradores.');
    return this.adminRepository.findAll();
  }

  async findOne(admin_id: string): Promise<Admin> {
    this.logger.debug(`findOne(): Buscando administrador con ID: ${admin_id}`);
    const admin = await this.adminRepository.findOneByAdminId(admin_id);
    if (!admin) {
      this.logger.warn(
        `findOne(): Administrador con ID "${admin_id}" no encontrado.`,
      );
      throw new NotFoundException(`Admin with ID "${admin_id}" not found.`);
    }
    return admin;
  }

  async findByUserIdInternal(user_id: string): Promise<Admin | null> {
    this.logger.debug(
      `findByUserIdInternal(): Buscando administrador por user_id (PK): ${user_id}`,
    );
    return this.adminRepository.findByUserId(user_id);
  }

  async update(
    admin_id: string,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Admin> {
    this.logger.debug(
      `update(): Actualizando administrador con ID: ${admin_id}`,
    );
    const admin = await this.adminRepository.findOneByAdminId(admin_id);
    if (!admin) {
      this.logger.warn(
        `update(): Administrador con ID "${admin_id}" no encontrado.`,
      );
      throw new NotFoundException(`Admin with ID "${admin_id}" not found.`);
    }

    if (updateAdminDto.user_id && updateAdminDto.user_id !== admin.user_id) {
      this.logger.warn(
        `update(): Intentando cambiar user_id de admin ${admin_id}. Operación no permitida.`,
      );
      throw new BadRequestException(
        'Cannot change the user of an existing admin record. Please delete and create a new one.',
      );
    }

    const { user_id, ...permissionsToUpdate } = updateAdminDto;
    Object.assign(admin, permissionsToUpdate);

    const updatedAdmin = await this.adminRepository.save(admin);
    this.logger.log(
      `update(): Administrador ${admin_id} actualizado exitosamente.`,
    );
    return this.adminRepository.findOneByAdminId(
      updatedAdmin.admin_id,
    ) as Promise<Admin>;
  }

  async remove(admin_id: string): Promise<void> {
    this.logger.debug(
      `remove(): Intentando eliminar administrador con ID: ${admin_id}`,
    );

    const admin = await this.adminRepository.findOneByAdminId(admin_id);
    if (!admin) {
      this.logger.warn(
        `remove(): Administrador con ID "${admin_id}" no encontrado.`,
      );
      throw new NotFoundException(`Admin with ID "${admin_id}" not found.`);
    }

    const defaultRole = await this.rolesRepository.findByName(
      'USER' as ValidRoleNames,
    );

    if (!defaultRole) {
      this.logger.error(
        `remove(): Rol 'USER' por defecto no encontrado. Incapaz de resetear rol de usuario.`,
      );
      throw new InternalServerErrorException(
        'Default role "USER" not found in the database. Cannot reset user role.',
      );
    }

    const queryRunner =
      this.adminRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const adminRepo = queryRunner.manager.getRepository(Admin);
      const userRepo = queryRunner.manager.getRepository(User);

      const deleteResult = await adminRepo.delete({ admin_id });
      if (deleteResult.affected === 0) {
        this.logger.warn(
          `remove(): No se pudo eliminar la entrada de admin con ID "${admin_id}".`,
        );
        throw new NotFoundException(`Admin with ID "${admin_id}" not found.`);
      }
      this.logger.log(`remove(): Entrada de admin ${admin_id} eliminada.`);

      // Buscar el usuario por su ID (PK)
      if (admin.user_id) {
        const userToUpdate = await userRepo.findOne({
          where: { id: admin.user_id }, // Usar 'id' en lugar de 'auth0_id'
        });
        if (userToUpdate) {
          await userRepo.update(
            { id: userToUpdate.id },
            { role_id: defaultRole.role_id, role_name: defaultRole.name },
          );
          this.logger.log(
            `remove(): Rol del usuario ${userToUpdate.email} reseteado a '${defaultRole.name}' mediante actualización directa.`,
          );
        } else {
          this.logger.warn(
            `remove(): Usuario asociado (ID: ${admin.user_id}) al admin ${admin_id} no encontrado para resetear rol.`,
          );
        }
      } else {
        this.logger.warn(
          `remove(): Admin ${admin_id} no tiene user_id (PK) asociado. No se pudo resetear el rol del usuario.`,
        );
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `remove(): Transacción de eliminación de admin completada exitosamente para ID: ${admin_id}`,
      );
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `remove(): Error durante la transacción de eliminación de admin para ID ${admin_id}:`,
        error instanceof Error ? error.message : 'Unknown error',
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove admin due to an internal error.',
      );
    } finally {
      if (queryRunner) {
        await queryRunner.release();
      }
    }
  }

  async removeAdminPermissionsByUserIdInternal(
    user_id: string, // Este userId ahora es el ID (PK) de la tabla User
    queryRunner: QueryRunner,
  ): Promise<DeleteResult> {
    this.logger.debug(
      `removeAdminPermissionsByUserIdInternal(): Eliminando permisos de admin para user_id (PK): ${user_id}`,
    );
    const transactionalAdminRepository =
      queryRunner.manager.getRepository(Admin);

    const deleteResult = await transactionalAdminRepository.delete({
      user_id: user_id,
    });

    return deleteResult;
  }
}
