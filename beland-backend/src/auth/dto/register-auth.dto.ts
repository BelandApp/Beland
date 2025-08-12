// src/auth/dto/register-auth.dto.ts
import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDate,
  IsIn,
  IsStrongPassword,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

// RegisterAuthDto define los campos necesarios para el registro directo (signup).
// PickType hereda las propiedades Y SUS VALIDACIONES como REQUERIDAS por defecto.
export class RegisterAuthDto extends PickType(CreateUserDto, [
  'email',
  'password',
  'confirmPassword',
  'address',
  'phone',
  'country',
  'city',
] as const) {
  // Ahora, si quieres campos OPCIONALES para el registro, defínelos aquí.
  // Estos campos NO deben estar en el array de PickType si son opcionales.

  @ApiProperty({
    description: 'Nombre de usuario (opcional)',
    example: 'johndoe',
    required: false, // Explicitly optional for Swagger
  })
  @IsOptional()
  @IsString()
  username?: string; // Marked as optional here

  @ApiProperty({
    description: 'Nombre completo del usuario (opcional)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({
    description: 'URL de la imagen de perfil (opcional)',
    example: 'https://example.com/photo.jpg',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  profile_picture_url?: string | null;

  // Los campos email, password, confirmPassword, address, phone, country, city
  // son ahora requeridos porque están en el PickType array y en CreateUserDto
  // no están marcados como opcionales. Sus validaciones se heredan.
}
