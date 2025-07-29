// src/inventory-items/dto/create-inventory-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInventoryItemDto {
  @ApiProperty({ description: 'ID del producto relacionado' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Cantidad disponible del producto' })
  @IsNumber()
  quantity_available: number;

  @ApiProperty({
    description: 'Etiqueta de oferta o promoción',
    required: false,
  })
  @IsOptional()
  @IsString()
  offer_label?: string;

  @ApiProperty({
    description: 'Fecha de expiración de la promoción',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  promotion_expires_at?: Date;
}
