// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsEnum, Matches, IsStrongPassword, MaxLength, MinLength, IsNotEmpty, IsNumber, IsEmpty, IsBoolean, IsDate } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description:
      'Proveedor de autenticación externo (google, instagram, facebook)',
    example: 'google',
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
    enum: ['USER', 'LEADER', 'ADMIN', 'SUPERADMIN'],
    default: 'USER',
  })
  @IsOptional()
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
  password: string

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
  confirmPassword: string

  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(80)
  address: string

  @IsNotEmpty()
  @IsNumber()
  phone: number

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  country: string

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  city: string

  @IsEmpty()
  isAdmin?: boolean

  @IsNotEmpty()
  @IsBoolean()
  isBlocked?: boolean

  @IsNotEmpty()
  @IsDate()
  deleted_at?: Date
}
