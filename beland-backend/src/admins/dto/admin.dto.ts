import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsString } from 'class-validator';

export class AdminDto {
  @IsUUID()
  @ApiProperty({ description: 'ID único del administrador.' })
  admin_id: string;

  @IsUUID() // user_id ahora es un UUID
  @ApiProperty({
    description: 'ID (PK) del usuario asociado a este administrador.',
  }) // Descripción actualizada
  user_id: string;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para gestionar contenido.' })
  content_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para gestionar usuarios.' })
  user_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para moderar.' })
  moderation_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para gestionar finanzas.' })
  finance_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para ver analíticas.' })
  analytics_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para gestionar configuraciones.' })
  settings_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para gestionar líderes.' })
  leader_management_permission: boolean;

  @IsBoolean()
  @ApiProperty({ description: 'Permiso para gestionar empresas.' })
  company_management_permission: boolean;
}
