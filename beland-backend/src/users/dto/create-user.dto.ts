// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsEnum,
  Matches,
  IsStrongPassword,
  MaxLength,
  MinLength,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsDate,
  IsEmpty,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description:
      'Proveedor de autenticación externo (google, instagram, facebook)',
    example: 'google',
    required: false, // Ahora es opcional
  })
  @IsOptional()
  @IsString()
  oauth_provider?: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Nombre de usuario (opcional)',
    example: 'johndoe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  profile_picture_url?: string;

  @ApiProperty({
    description: 'Rol del usuario',
    // Revertido a los tipos de roles originales
    enum: ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN'],
    default: 'USER',
  })
  @IsOptional() // El rol puede ser asignado por defecto en el servicio
  @IsEnum(['USER', 'LEADER', 'ADMIN', 'SUPERADMIN'])
  role?: 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN';

  @ApiProperty({
    required: true,
    description: 'password - contraseña de usuario',
    example: 'Clave!123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @IsStrongPassword({
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
  })
  @Matches(/^[A-Za-z\d!@#$%^&*]+$/, {
    message:
      'solo se permiten los siguientes simbolos: !@#$%^&* (sin otros caracteres especiales)',
  })
  @Matches(/[A-Za-z\d!@#$%^&*]/, {
    message: 'Debe incluir al menos uno de los siguientes simbolos: !@#$%^&*',
  })
  password: string;

  @ApiProperty({
    required: true,
    description: 'confirmPassword - contraseña de usuario',
    example: 'Clave!123',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(15)
  @IsStrongPassword({
    minUppercase: 1,
    minLowercase: 1,
    minNumbers: 1,
  })
  confirmPassword: string;

  @ApiProperty({
    description: 'Dirección del usuario',
    example: 'Calle 123, Ciudad',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  address: string;

  @ApiProperty({
    description: 'Número de teléfono',
    example: 1234567890,
  })
  @IsNotEmpty()
  @IsNumber()
  phone: number;

  @ApiProperty({
    description: 'País del usuario',
    example: 'Colombia',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country: string;

  @ApiProperty({
    description: 'Ciudad del usuario',
    example: 'Bogotá',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city: string;

  @ApiProperty({
    description:
      'Si el usuario es administrador (solo para seeder, no para cliente)',
    example: false,
    required: false,
  })
  @IsOptional() // Se mantiene como opcional y se usará en el seeder
  @IsBoolean()
  isAdmin?: boolean; // Propiedad para el seeder

  @ApiProperty({
    description: 'Si el usuario está bloqueado',
    example: false,
    default: false,
  })
  @IsBoolean()
  isBlocked: boolean; // Revertido a isBlocked

  @ApiProperty({
    description: 'Fecha de eliminación (soft delete)',
    example: null,
    required: false,
    nullable: true,
  })
  @IsOptional() // Puede ser nulo o no proporcionado
  @IsDate()
  deleted_at?: Date | null; // Revertido a deleted_at
}
