// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description:
      'Proveedor de autenticación externo (google, instagram, facebook, etc.)',
    example: 'google',
    required: false,
  })
  @IsOptional()
  @IsString()
  oauth_provider?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
    required: true, // Marked as required for Swagger and validation
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario (opcional)', // Keep as optional here
    example: 'johndoe',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/photo.jpg',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  profile_picture_url?: string | null;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'SecurePass123!',
    required: true, // Marked as required for Swagger and validation
  })
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Confirmación de la contraseña del usuario',
    example: 'SecurePass123!',
    required: true, // Marked as required for Swagger and validation
  })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string; // Validation logic will be in the service

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle 123, Ciudad',
    required: true, // Marked as required for Swagger and validation
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: 1234567890,
    required: true, // Marked as required for Swagger and validation
  })
  @IsNotEmpty()
  @IsNumber()
  phone: number;

  @ApiProperty({
    description: 'País del usuario',
    example: 'Colombia',
    required: true, // Marked as required for Swagger and validation
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  country: string;

  @ApiProperty({
    description: 'Ciudad del usuario',
    example: 'Bogotá',
    required: true, // Marked as required for Swagger and validation
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  city: string;

  @ApiProperty({
    description:
      'Si el usuario es administrador (solo para seeder, no para cliente)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_admin_seeder?: boolean = false;

  @ApiProperty({
    description: 'ID de Auth0 del usuario (opcional, si se usa Auth0)',
    example: 'auth0|abcdef1234567890abcdef1234',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  auth0_id?: string | null;

  @ApiProperty({
    description: 'Rol del usuario. Por defecto, USER.',
    enum: ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA'],
    default: 'USER',
    required: false,
  })
  @IsOptional()
  @IsEnum(['USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA'])
  role?: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA' = 'USER';

  @ApiProperty({
    description: 'Si el usuario está bloqueado. Por defecto, false.',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean = false;

  @ApiProperty({
    description: 'Fecha de eliminación lógica (soft delete).',
    example: '2024-01-01T00:00:00.000Z',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deleted_at?: Date | null;
}
