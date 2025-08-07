import {
  IsString,
  IsOptional,
  IsEmail,
  Length,
  IsUrl,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCharityDto {
  @ApiProperty({
    description: 'Nombre legal de la fundación',
    example: 'Fundación Ayuda Solidaria',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiPropertyOptional({
    description: 'Nombre comercial o abreviado',
    example: 'Ayuda Solidaria',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  display_name?: string;

  @ApiProperty({
    description: 'Número de registro legal / RUC / Tax ID',
    example: '20123456789',
    minLength: 5,
    maxLength: 50,
  })
  @IsString()
  @Length(5, 50)
  registration_number: string;

  @ApiPropertyOptional({
    description: 'Descripción corta de la fundación',
    example: 'Organización sin fines de lucro dedicada a ayudar a comunidades vulnerables.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Página web oficial',
    example: 'https://www.ayudasolidaria.org',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Email de contacto principal',
    example: 'contacto@ayudasolidaria.org',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+54 9 11 1234 5678',
    minLength: 5,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Dirección física',
    example: 'Av. Siempre Viva 1234, Ciudad',
    minLength: 5,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  @ApiPropertyOptional({
    description: 'Logo o imagen representativa',
    example: 'https://www.ayudasolidaria.org/logo.png',
  })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiProperty({
    description: 'ID del usuario creador de la fundación',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional({
    description: 'Estado activo o deshabilitado (por defecto true)',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
