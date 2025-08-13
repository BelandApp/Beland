// src/products/dto/create-product.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Descripción del producto', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Costo del producto en monedas internas' })
  @IsNumber()
  cost: number;

  @ApiProperty({ description: 'Precio del producto en monedas internas' })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'URL de la imagen del producto',
    required: false,
  })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ description: 'UUID de la Categoría del producto', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;
}
