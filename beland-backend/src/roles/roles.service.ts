import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
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
  constructor(
    private readonly rolesRepository: RolesRepository,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDto> {
    const existingRole = await this.rolesRepository.findByName(
      createRoleDto.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN', // Cast para compatibilidad
    );
    if (existingRole) {
      throw new BadRequestException(
        `Role with name "${createRoleDto.name}" already exists.`,
      );
    }
    const role = this.rolesRepository.create({
      name: createRoleDto.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN',
      description: createRoleDto.description,
      is_active: createRoleDto.is_active,
    });
    const savedRole = await this.rolesRepository.save(role);
    return plainToInstance(RoleDto, savedRole);
  }

  async findAll(): Promise<RoleDto[]> {
    const roles = await this.rolesRepository.find(); // find() retorna Role[]
    return plainToInstance(RoleDto, roles); // Transforma Role[] a RoleDto[]
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.rolesRepository.findOne({ where: { role_id: id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }
    return plainToInstance(RoleDto, role);
  }

  async findUsersByRoleId(roleId: string): Promise<UserDto[]> {
    const role = await this.rolesRepository.findOne({
      where: { role_id: roleId },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found.`);
    }
    const users = await this.userRepository.find({
      where: { role_name: role.name },
    });

    if (!users || users.length === 0) {
      throw new NotFoundException(
        `No users found for role with ID "${roleId}".`,
      );
    }
    return plainToInstance(UserDto, users);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleDto> {
    const role = await this.rolesRepository.findOne({ where: { role_id: id } });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }

    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findByName(
        updateRoleDto.name as 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN', // Cast
      );
      if (existingRole) {
        throw new BadRequestException(
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
    return plainToInstance(RoleDto, updatedRole);
  }

  async remove(id: string): Promise<void> {
    const roleToDelete = await this.rolesRepository.findOne({
      where: { role_id: id },
    });
    if (!roleToDelete) {
      throw new NotFoundException(`Role with ID "${id}" not found.`);
    }

    const CRITICAL_ROLES = ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN'];

    if (CRITICAL_ROLES.includes(roleToDelete.name)) {
      throw new BadRequestException(
        `Cannot delete the critical role "${roleToDelete.name}".`,
      );
    }

    const defaultRole = await this.rolesRepository.findByName('USER');

    if (!defaultRole) {
      throw new InternalServerErrorException(
        'Cannot delete role: The default "USER" role is missing, unable to reassign users.',
      );
    }

    await this.userRepository.update(
      { role_name: roleToDelete.name },
      { role_name: defaultRole.name, role_id: defaultRole.role_id },
    );

    await this.rolesRepository.remove(roleToDelete);
  }
}
