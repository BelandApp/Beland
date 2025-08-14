// src/group-invitations/dto/create-group-invitation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsEnum,
  ValidateIf, // Importar ValidateIf
} from 'class-validator';

export class CreateGroupInvitationDto {
  @ApiProperty({
    description: 'ID del grupo al que se invita',
    example: 'uuid-del-grupo',
  })
  @IsUUID()
  group_id: string;

  @ApiProperty({
    description: 'Email del usuario a invitar',
    example: 'invitado@example.com',
    required: false,
  })
  @ValidateIf((o) => !o.username && (o.phone === undefined || o.phone === null)) // Solo requerido si username o phone no están presentes
  @IsOptional() // Marcar como opcional para que no sea estrictamente necesario si otro campo lo es
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Username del usuario a invitar',
    example: 'usernameInvitado',
    required: false,
  })
  @ValidateIf((o) => !o.email && (o.phone === undefined || o.phone === null)) // Solo requerido si email o phone no están presentes
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario a invitar',
    example: 1234567890,
    required: false,
  })
  @ValidateIf((o) => !o.email && !o.username) // Solo requerido si email o username no están presentes
  @IsOptional()
  @IsNumber()
  phone?: number;

  @ApiProperty({
    description: 'Rol inicial del miembro en el grupo (MEMBER por defecto)',
    enum: ['MEMBER'], // Actualmente solo permitiremos invitar como MEMBER
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsEnum(['MEMBER'])
  role?: 'MEMBER' = 'MEMBER';
}
