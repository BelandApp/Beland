// src/group-members/dto/create-group-member.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsNumberString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
    description: 'Email del usuario a invitar (opcional).',
    example: 'invitado@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser una dirección de correo válida.' })
  email?: string;

  @ApiProperty({
    description: 'Nombre de usuario del usuario a invitar (opcional).',
    example: 'john.doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío.' })
  username?: string;

  @ApiProperty({
    description: 'Número de teléfono del usuario a invitar (opcional).',
    example: '1234567890',
    required: false,
  })
  @IsOptional()
  @IsNumberString(
    {},
    { message: 'El teléfono debe ser una cadena de números.' },
  )
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío.' })
  phone?: string;

  @ApiProperty({
    description: 'Rol del usuario a invitar dentro del grupo',
    enum: ['LEADER', 'MEMBER'],
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsIn(['LEADER', 'MEMBER'], { message: 'El rol debe ser LEADER o MEMBER.' })
  role?: 'LEADER' | 'MEMBER' = 'MEMBER';

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
