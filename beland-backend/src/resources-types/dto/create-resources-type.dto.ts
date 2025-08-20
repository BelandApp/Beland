import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ResourceTypeCode } from '../entities/resources-type.entity'; // importa el enum

export class CreateResourcesTypeDto {
  @ApiProperty({
    description: 'Unique code for the resource type',
    example: ResourceTypeCode.DISCOUNT,
    enum: ResourceTypeCode,  // 👈 Usa el mismo enum
  })
  @IsEnum(ResourceTypeCode) // 👈 validación con el enum
  @IsNotEmpty()
  code: ResourceTypeCode;

  @ApiProperty({
    description: 'Name of the resource type',
    example: 'Descuentos Beland',
  })
  @IsNotEmpty()
  @MaxLength(150) // 👈 ojo que tu entity es varchar(150)
  name: string;

  @ApiProperty({
    description: 'Description of the resource type',
    example: 'Descuento aplicable en compras o servicios',
  })
  @IsNotEmpty()
  @MaxLength(150) // 👈 ojo que tu entity es varchar(150)
  description: string;

  @ApiProperty({
    description: 'Indicates if the resource type is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
