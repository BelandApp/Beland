// src/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsDate,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

// No se necesita AdminPermissionsDto ya que se eliminan los permisos de admin específicos
// y el rol se maneja directamente como string.

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Rol del usuario',
    // ¡Añadido 'EMPRESA' aquí!
    enum: ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'COMMERCE', 'FUNDATION'],
    required: false,
  })
  @IsOptional()
  // ¡Añadido 'EMPRESA' aquí!
  @IsEnum(['USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'COMMERCE', 'FUNDATION'])
  role?: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'COMMERCE' | 'FUNDATION'; // Revertido a role (string literal)

  @ApiProperty({
    description: 'Si el usuario está bloqueado',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean; // Revertido a isBlocked

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: '2024-01-01T00:00:00.000Z',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  deleted_at?: Date | null; // Revertido a deleted_at

  // Campos que pueden ser actualizados por un admin, pero no por el usuario 'me'
  // No se incluyen aquí si no se gestionan explícitamente como parte de la actualización de un usuario por un admin.
  // Si se necesita actualizar password, se haría a través de un DTO específico de cambio de contraseña.
}
