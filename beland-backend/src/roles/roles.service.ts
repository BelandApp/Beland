import {
  Injectable,
  NotFoundException,
  BadRequestException, // Mantener si se usa para otras validaciones de DTO
  InternalServerErrorException,
  ConflictException, // ¡Importar ConflictException!
  Logger, // Importar Logger
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import { UserDto } from '../users/dto/user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { Role } from './entities/role.entity';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name); // Añadir logger

  constructor(
    private readonly rolesRepository: RolesRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.debug(
      `create(): Intentando crear rol con nombre: ${createRoleDto.name}`,
    ); // Log de depuración
    const existingRole = await this.rolesRepository.findByName(
      createRoleDto.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
    );
    if (existingRole) {
      // ¡CAMBIO CLAVE AQUÍ! Lanzar ConflictException
      throw new ConflictException(
        `Role with name "${createRoleDto.name}" already exists.`,
      );
    }
    const role = this.rolesRepository.create({
      name: createRoleDto.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
      description: createRoleDto.description,
      is_active: createRoleDto.is_active,
    });
    const savedRole = await this.rolesRepository.save(role);
    this.logger.log(`✅ Rol "${savedRole.name}" creado con éxito.`); // Log de éxito
    return plainToInstance(RoleDto, savedRole);
  }

  async findAll(): Promise<RoleDto[]> {
    this.logger.debug('findAll(): Buscando todos los roles.');
    const roles = await this.rolesRepository.find();
    return plainToInstance(RoleDto, roles);
  }

  async findOne(id: string): Promise<RoleDto> {
    this.logger.debug(`findOne(): Buscando rol con ID: ${id}.`);
    const role = await this.rolesRepository.findOne({ where: { role_id: id } });
    if (!role) {
      this.logger.warn(`findOne(): Rol con ID "${id}" no encontrado.`);
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }
    return plainToInstance(RoleDto, role);
  }

  async findUsersByRoleId(roleId: string): Promise<UserDto[]> {
    this.logger.debug(
      `findUsersByRoleId(): Buscando usuarios para rol con ID: ${roleId}.`,
    );
    const role = await this.rolesRepository.findOne({
      where: { role_id: roleId },
    });
    if (!role) {
      this.logger.warn(
        `findUsersByRoleId(): Rol con ID "${roleId}" no encontrado.`,
      );
      throw new NotFoundException(`Role with ID "${roleId}" not found.`);
    }
    const users = await this.userRepository.find({
      where: { role_name: role.name },
    });

    if (!users || users.length === 0) {
      this.logger.warn(
        `findUsersByRoleId(): No se encontraron usuarios para el rol con ID "${roleId}".`,
      );
      throw new NotFoundException(
        `No users found for role with ID "${roleId}".`,
      );
    }
    return plainToInstance(UserDto, users);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDto> {
    this.logger.debug(`update(): Actualizando rol con ID: ${id}.`);
    const role = await this.rolesRepository.findOne({ where: { role_id: id } });
    if (!role) {
      this.logger.warn(`update(): Rol con ID "${id}" no encontrado.`);
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findByName(
        updateRoleDto.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
      );
      if (existingRole) {
        // ¡CAMBIO CLAVE AQUÍ! Lanzar ConflictException
        throw new ConflictException(
          `Role with name "${updateRoleDto.name}" already exists.`,
        );
      }
      role.name = updateRoleDto.name as
        | 'USER'
        | 'LEADER'
        | 'ADMIN'
        | 'SUPERADMIN';
    }
    if (updateRoleDto.description !== undefined) {
      role.description = updateRoleDto.description;
    }
    if (updateRoleDto.is_active !== undefined) {
      role.is_active = updateRoleDto.is_active;
    }

    const updatedRole = await this.rolesRepository.save(role);
    this.logger.log(
      `✅ Rol "${updatedRole.name}" (ID: ${updatedRole.role_id}) actualizado con éxito.`,
    );
    return plainToInstance(RoleDto, updatedRole);
  }

  async remove(id: string): Promise<void> {
    this.logger.debug(`remove(): Intentando eliminar rol con ID: ${id}.`);
    const roleToDelete = await this.rolesRepository.findOne({
      where: { role_id: id },
    });
    if (!roleToDelete) {
      this.logger.warn(`remove(): Rol con ID "${id}" no encontrado.`);
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }

    const CRITICAL_ROLES = ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN'];

    if (CRITICAL_ROLES.includes(roleToDelete.name)) {
      this.logger.warn(
        `remove(): Intento de eliminar rol crítico "${roleToDelete.name}".`,
      );
      throw new BadRequestException(
        `Cannot delete the critical role "${roleToDelete.name}".`,
      );
    }

    const defaultRole = await this.rolesRepository.findByName('USER');

    if (!defaultRole) {
      this.logger.error(
        `remove(): Rol "USER" por defecto no encontrado. Incapaz de reasignar usuarios.`,
      );
      throw new InternalServerErrorException(
        'Cannot delete role: The default "USER" role is missing, unable to reassign users.',
      );
    }

    // Reasignar usuarios a un rol por defecto antes de eliminar el rol
    await this.userRepository.update(
      { role_name: roleToDelete.name },
      { role_name: defaultRole.name, role_id: defaultRole.role_id },
    );
    this.logger.log(
      `Usuarios del rol "${roleToDelete.name}" reasignados al rol "${defaultRole.name}".`,
    );

    await this.rolesRepository.remove(roleToDelete);
    this.logger.log(`✅ Rol con ID "${id}" eliminado exitosamente.`);
  }
}
