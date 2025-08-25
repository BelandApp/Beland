// src/auth/dto/register-auth.dto.ts
import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber, // Añadir IsNumber para la validación de 'phone'
  IsNotEmpty,
  MinLength,
  Matches, // Para validación de contraseña fuerte si se usa
} from 'class-validator';

// RegisterAuthDto define los campos necesarios para el registro directo (signup).
// PickType hereda las propiedades Y SUS VALIDACIONES como REQUERIDAS por defecto.
// Hacemos que solo email, password y confirmPassword sean requeridos por defecto aquí.
export class RegisterAuthDto extends PickType(CreateUserDto, [
  'email',
  'password',
  'confirmPassword',
] as const) {
  // Ahora, las siguientes propiedades serán explícitamente opcionales.
  // Ya no están en el array de PickType, por lo que no son requeridas por herencia.
  // Añadimos @IsOptional() y @ApiPropertyOptional para la validación y Swagger.

  @ApiPropertyOptional({
    description:
      'Nombre de usuario. Opcional para registro Auth0, pero recomendado.',
    example: 'johndoe',
    required: false, // Ahora es opcional
  })
  @IsOptional()
  @IsString({ message: 'username debe ser una cadena de texto' })
  @MinLength(3, { message: 'username debe tener al menos 3 caracteres' })
  username?: string; // Ahora es opcional

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario (opcional)',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'full_name debe ser una cadena de texto' })
  full_name?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen de perfil (opcional)',
    example: 'https://example.com/photo.jpg',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'profile_picture_url debe ser una cadena de texto' })
  profile_picture_url?: string | null;

  @ApiPropertyOptional({
    description: 'Dirección del usuario (opcional)',
    example: '123 Main St',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'address debe ser una cadena de texto' })
  address?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario (opcional)',
    example: 123456789, // Ejemplo numérico
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'phone debe ser un número válido' })
  phone?: number; // Ahora es opcional

  @ApiPropertyOptional({
    description: 'País del usuario (opcional)',
    example: 'USA',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'country debe ser una cadena de texto' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Ciudad del usuario (opcional)',
    example: 'New York',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'city debe ser una cadena de texto' })
  city?: string;
}

export class ConfirmAuthDto {
  @ApiProperty({
    description: 'Codigo de verificación',
    example: '365793',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El código no puede estar vacío.' })
  code: string;

  @ApiProperty({
    description: 'Email a Verificar',
    example: 'example@gmail.com',
    required: true,
  })
  @IsEmail({}, { message: 'Debe ser un email válido.' })
  @IsNotEmpty({ message: 'El email no puede estar vacío.' })
  email: string;
}
