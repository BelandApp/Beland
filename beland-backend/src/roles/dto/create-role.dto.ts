import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre del rol',
    // ¡ACTUALIZADO para incluir EMPRESA en el ejemplo y enum!
    example: 'USER', // USER, LEADER, ADMIN, SUPERADMIN, EMPRESA
    enum: ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA'],
  })
  @IsString()
  @IsNotEmpty()
  @IsEnum(['USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA']) // Asegurarse de que el valor sea uno de los roles válidos
  name: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA'; // Tipo literal para el nombre del rol

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Usuario básico del sistema',
    required: false,
    nullable: true, // Añadido nullable para coincidir con la entidad
  })
  @IsOptional()
  @IsString()
  description?: string | null; // Cambiado a string | null

  @ApiProperty({
    description: 'Si el rol está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
