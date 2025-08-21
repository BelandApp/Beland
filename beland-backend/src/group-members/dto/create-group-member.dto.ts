// src/group-members/dto/create-group-member.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsNumberString,
  IsIn,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum GroupMemberRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
}

// DTO for creating a GroupMember entry (used internally by service/repository)
// This DTO expects the UUIDs for group_id and user_id.
export class CreateGroupMemberDto {
  @ApiProperty({ description: 'ID del grupo al que se une el usuario' })
  @IsUUID()
  group_id: string;

  @ApiProperty({ description: 'ID del usuario que se une al grupo' })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Rol del usuario dentro del grupo',
    enum: ['LEADER', 'MEMBER'],
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsIn(['LEADER', 'MEMBER'])
  role?: 'LEADER' | 'MEMBER' = 'MEMBER';
}

// DTO for inviting a user via API (can use email, username, or phone)
// This DTO is used for the incoming request body from the client.
export class InviteUserDto {
  @ApiProperty({
    description: 'ID del grupo al que se añade el miembro.',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    required: true,
  })
  @IsUUID()
  group_id: string;

  @ApiProperty({
    description: 'ID del usuario que se añade al grupo.',
    format: 'uuid',
    example: 'f9e8d7c6-b5a4-3210-fedc-ba9876543210',
    required: false, // Opcional si se usa email/username/phone
  })
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @ApiProperty({
    description: 'Email del usuario a invitar (si user_id no está presente).',
    example: 'invitado@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description:
      'Nombre de usuario del usuario a invitar (si user_id/email no están presentes).',
    example: 'invitado_username',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiProperty({
    description:
      'Número de teléfono del usuario a invitar (si user_id/email/username no están presentes).',
    example: '+34600123456',
    required: false,
  })
  @IsOptional()
  @IsString() // CORREGIDO: Asegura que el teléfono es un string
  phone?: string;

  @ApiProperty({
    description: 'Rol del miembro en el grupo.',
    enum: GroupMemberRole,
    example: GroupMemberRole.MEMBER,
    default: GroupMemberRole.MEMBER,
    required: false,
  })
  @IsOptional()
  @IsEnum(GroupMemberRole)
  role?: GroupMemberRole;

  // Custom validation to ensure at least one identifier (email, username, or phone) is provided
  @IsNotEmpty({
    message:
      'Debe proporcionar al menos un email, nombre de usuario o número de teléfono.',
    context: {
      isEitherDefined: (o: InviteUserDto) =>
        !!o.email || !!o.username || !!o.phone,
    },
  })
  validateEitherDefined() {
    if (!this.email && !this.username && !this.phone) {
      return false; // Validation will fail
    }
    return true;
  }
}
