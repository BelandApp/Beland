// src/group-invitations/dto/create-group-invitation.dto.ts
import {
  IsUUID,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  MinLength,
  IsDateString, // Usar IsDateString para validar un string de fecha
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupInvitationStatus } from '../entities/group-invitation.entity'; // Asegúrate de que esta enumeración existe

export class CreateGroupInvitationDto {
  @ApiProperty({
    description: 'ID del grupo al que se refiere la invitación.',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: true,
  })
  @IsUUID()
  group_id: string;

  @ApiPropertyOptional({
    // Hacemos este campo opcional
    description: 'ID del usuario invitado (si ya existe en la BD).',
    format: 'uuid',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  invited_user_id?: string; // Si ya se tiene el ID del usuario en la BD

  @ApiPropertyOptional({
    // Hacemos este campo opcional
    description: 'Email del usuario a invitar.',
    example: 'invitado@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    // Hacemos este campo opcional
    description: 'Nombre de usuario del usuario a invitar.',
    example: 'invitado_user',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiPropertyOptional({
    // Hacemos este campo opcional
    description: 'Número de teléfono del usuario a invitar.',
    example: '+34600123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    // Hacemos este campo opcional
    description:
      'Rol que tendrá el usuario en el grupo si acepta la invitación.',
    enum: ['LEADER', 'MEMBER'], // Asumiendo estos roles
    example: 'MEMBER',
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsEnum(['LEADER', 'MEMBER'])
  role?: 'LEADER' | 'MEMBER';

  // Eliminamos `expires_at` y `status` del DTO de entrada. Serán generados por el servicio.
  // @ApiProperty({
  //   description: 'Fecha y hora de expiración de la invitación.',
  //   type: String,
  //   format: 'date-time',
  //   example: '2024-12-31T23:59:59Z',
  //   required: false,
  // })
  // @IsOptional()
  // @IsDateString() // Valida un string de fecha ISO 8601
  // expires_at?: Date;

  // @ApiProperty({
  //   description: 'Estado actual de la invitación.',
  //   enum: GroupInvitationStatus,
  //   example: GroupInvitationStatus.PENDING,
  //   default: GroupInvitationStatus.PENDING,
  //   required: false,
  // })
  // @IsOptional()
  // @IsEnum(GroupInvitationStatus)
  // status?: GroupInvitationStatus;

  // Eliminamos `sender_id` del DTO de entrada. Se obtendrá del token del usuario autenticado.
  // @ApiProperty({
  //   description: 'ID del usuario que envía la invitación.',
  //   format: 'uuid',
  //   example: 'a1b2c3d4-e5f6-7890-1234-567890aaaaaa',
  //   required: false, // Se suele obtener del JWT
  // })
  // @IsOptional()
  // @IsUUID()
  // sender_id?: string;
}
