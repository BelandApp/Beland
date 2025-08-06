import {
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator'; // Importar IsUUID
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto {
  @IsUUID() // Asegura que user_id sea un UUID válido
  @IsNotEmpty()
  @ApiProperty({
    description:
      'ID (PK) del usuario al que se le otorgan permisos de administrador.', // Descripción actualizada
  })
  user_id: string; // Ahora es el ID (UUID) del usuario

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar contenido.',
    default: true,
    required: false,
  })
  content_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar usuarios.',
    default: true,
    required: false,
  })
  user_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para moderar.',
    default: true,
    required: false,
  })
  moderation_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar finanzas.',
    default: true,
    required: false,
  })
  finance_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para ver analíticas.',
    default: true,
    required: false,
  })
  analytics_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar configuraciones.',
    default: true,
    required: false,
  })
  settings_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar líderes.',
    default: true,
    required: false,
  })
  leader_management_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar empresas.',
    default: true,
    required: false,
  })
  company_management_permission?: boolean;
}
