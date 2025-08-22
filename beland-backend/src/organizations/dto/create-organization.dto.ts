import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsUUID,
  Length,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Nombre comercial del negocio',
    example: 'Tienda La Buena Compra',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @Length(2, 150)
  name: string;

  @ApiPropertyOptional({
    description: 'Nombre legal del negocio',
    example: 'La Buena Compra S.A.',
    minLength: 2,
    maxLength: 150,
  })
  @IsOptional()
  @IsString()
  @Length(2, 150)
  legal_name?: string;

  @ApiPropertyOptional({
    description: 'RUC o número de identificación fiscal',
    example: '20123456789',
    minLength: 5,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  ruc?: string;

  @ApiPropertyOptional({
    description: 'Categoría del negocio',
    example: 'Electrónica',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  category?: string;

  @ApiPropertyOptional({
    description: 'Descripción del negocio',
    example: 'Venta de productos electrónicos y accesorios',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del negocio',
    example: '+54 9 11 1234 5678',
    minLength: 5,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Length(5, 20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico de contacto',
    example: 'contacto@buenacompra.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Dirección física del negocio',
    example: 'Av. Corrientes 1234, Buenos Aires',
    minLength: 5,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  @ApiPropertyOptional({
    description: 'Ciudad donde se encuentra el negocio',
    example: 'Buenos Aires',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Provincia o estado',
    example: 'Buenos Aires',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  province?: string;

  @ApiPropertyOptional({
    description: 'País',
    example: 'Argentina',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Latitud geográfica',
    example: -34.6037,
    type: Number,
    maximum: 90,
    minimum: -90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitud geográfica',
    example: -58.3816,
    type: Number,
    maximum: 180,
    minimum: -180,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 7 })
  longitude?: number;

  @ApiPropertyOptional({
    description: 'URL del logo del negocio',
    example: 'https://miapp.com/logos/buenacompra.png',
  })
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional({
    description: 'Sitio web del negocio',
    example: 'https://www.buenacompra.com',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo del negocio',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'ID del usuario dueño del negocio',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsUUID()
  user_id: string;
}
