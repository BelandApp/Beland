import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Dirección de correo electrónico del usuario.',
    example: 'usuario@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Contraseña del usuario.',
    example: 'ContrasenaSegura123!',
  })
  password: string;
}
