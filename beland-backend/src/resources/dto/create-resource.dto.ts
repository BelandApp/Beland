import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsDate,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateResourceDto {
  @ApiProperty({
    description: 'Unique code that identifies the resource',
    example: 'DISC-2025-01',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Name of the resource',
    example: '20% Off in Supermarket',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Detailed description of the resource',
    example: 'Valid for all products in participating stores until stock runs out.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Optional URL to the resource image',
    example: 'https://beland.com/resources/img123.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  url_image?: string;

  @ApiProperty({
    description: 'Becoin value assigned to this resource (must be >0 if discount is 0)',
    example: 3500,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  becoin_value: number;

  @ApiProperty({
    description: 'Discount percentage applied (1–100, must be >0 if becoin_value is 0)',
    example: 20,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  @Max(100)
  discount: number;

  @ApiProperty({
    description: 'Cantidad limite que un usuario puede adquirir el cupon entre activos y no activos (por defecto 1. Valor 0 es sin limite)',
    example: 3,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  limit_user: number;

  @ApiProperty({
    description: 'Cantidad limite que un usuario puede adquirir de cupones activos sin usar (por defecto 1. Valor 0 es sin limite)',
    example: 3,
    minimum: 0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  limit_user_active: number;

  @ApiProperty({
    description: 'Cantidad limite que Beland puede ofrecer a sus usuarios (por defecto es 0, significa sin limites)',
    example: 500,
    minimum:0,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Type(() => Number)
  @Min(0)
  limit_app: number;

  @ApiProperty({
    description: 'Indicates if the resource is expired',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_expired?: boolean;

  @ApiProperty({
    description: 'Expiration date of the resource',
    example: '2025-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expires_at?: Date;

  @ApiProperty({
    description: 'Resource type ID (foreign key)',
    example: 'cbe36a6b-9c39-4a40-ae26-5a7b4b217f40',
  })
  @IsUUID()
  @IsNotEmpty()
  resource_type_id: string;

}
