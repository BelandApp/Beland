import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterAuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Dirección de correo electrónico del usuario.',
    example: 'usuario@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres.' })
  @MaxLength(128, {
    message: 'La contraseña no puede exceder los 128 caracteres.',
  })
  @ApiProperty({
    description: 'Contraseña del usuario.',
    example: 'ContrasenaSegura123!',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del usuario.', example: 'Juan Pérez' })
  name: string;

  // No necesitamos confirmPassword aquí, ya que Auth0 maneja la validación de la contraseña.
  // Si tu frontend lo envía, puedes añadirlo y validarlo a nivel de frontend o en el DTO si lo deseas.
}
