import { IsBoolean, IsOptional, IsUUID } from 'class-validator'; // Importar IsUUID
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAdminDto {
  @IsUUID() // user_id ahora es un UUID
  @IsOptional()
  user_id?: string; // Aunque no se permite cambiar, se mantiene para consistencia del DTO

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar contenido.',
    required: false,
  })
  content_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar usuarios.',
    required: false,
  })
  user_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Permiso para moderar.', required: false })
  moderation_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar finanzas.',
    required: false,
  })
  finance_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para ver analíticas.',
    required: false,
  })
  analytics_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar configuraciones.',
    required: false,
  })
  settings_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar líderes.',
    required: false,
  })
  leader_management_permission?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    description: 'Permiso para gestionar empresas.',
    required: false,
  })
  company_management_permission?: boolean;
}
