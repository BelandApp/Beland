// src/group-invitations/dto/group-invitation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroupInvitationStatus } from '../entities/group-invitation.entity';
import { GroupDto } from 'src/groups/dto/group.dto'; // Importa GroupDto
import { UserDto } from 'src/users/dto/user.dto'; // Importa UserDto

export class GroupInvitationDto {
  @ApiProperty({
    description: 'ID único de la invitación a grupo.',
    format: 'uuid',
    example: 'c1d2e3f4-a5b6-7890-1234-567890abcdef',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'ID del grupo al que se refiere la invitación.',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsUUID()
  group_id: string;

  @ApiProperty({
    description: 'Información del grupo asociado.',
    type: () => GroupDto,
  })
  @Type(() => GroupDto)
  @ValidateNested()
  group: GroupDto;

  @ApiProperty({
    description: 'ID del usuario que envió la invitación.',
    format: 'uuid',
    example: 'sender-uuid-123',
  })
  @IsUUID()
  sender_id: string;

  @ApiProperty({
    description: 'Información del usuario que envió la invitación.',
    type: () => UserDto,
  })
  @Type(() => UserDto)
  @ValidateNested()
  sender: UserDto;

  @ApiProperty({
    description: 'ID del usuario invitado (si ya es un usuario registrado).',
    format: 'uuid',
    example: 'invited-uuid-456',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  invited_user_id?: string;

  @ApiProperty({
    description:
      'Información del usuario invitado (si ya es un usuario registrado).',
    type: () => UserDto,
    nullable: true,
  })
  @IsOptional()
  @Type(() => UserDto)
  @ValidateNested()
  invited_user?: UserDto;

  @ApiProperty({
    description: 'Email del usuario invitado.',
    example: 'invited@example.com',
    nullable: true,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Nombre de usuario del usuario invitado.',
    example: 'john_doe',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario invitado.',
    example: '+1234567890',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description:
      'Rol que tendrá el usuario en el grupo si acepta la invitación.',
    enum: ['LEADER', 'MEMBER'],
    example: 'MEMBER',
  })
  @IsEnum(['LEADER', 'MEMBER'])
  role: 'LEADER' | 'MEMBER';

  @ApiProperty({
    description: 'Estado actual de la invitación.',
    enum: GroupInvitationStatus,
    example: GroupInvitationStatus.PENDING,
  })
  @IsEnum(GroupInvitationStatus)
  status: GroupInvitationStatus;

  @ApiProperty({
    description: 'Fecha y hora de expiración de la invitación.',
    type: String, // String para la representación de la API
    format: 'date-time',
    example: '2025-08-24T10:00:00.000Z',
  })
  @IsDate() // Valida que sea un objeto Date, que se serializará a string ISO por el interceptor
  @Type(() => Date)
  expires_at: Date;

  @ApiProperty({
    description: 'Fecha y hora del último recordatorio enviado.',
    type: String,
    format: 'date-time',
    example: '2025-08-22T08:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reminder_sent_at?: Date;

  @ApiProperty({
    description: 'Fecha y hora de creación de la invitación.',
    type: String,
    format: 'date-time',
    example: '2025-08-21T09:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  created_at: Date;

  @ApiProperty({
    description: 'Fecha y hora de la última actualización de la invitación.',
    type: String,
    format: 'date-time',
    example: '2025-08-21T09:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  updated_at: Date;

  @ApiProperty({
    description: 'Fecha y hora de eliminación lógica de la invitación.',
    type: String,
    format: 'date-time',
    example: '2025-08-21T09:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deleted_at?: Date;
}
