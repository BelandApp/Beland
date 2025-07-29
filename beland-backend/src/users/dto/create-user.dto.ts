// src/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsEnum } from 'class-validator';

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
}
