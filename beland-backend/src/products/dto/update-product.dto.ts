// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {
  IsOptional,
  IsNotEmpty,
  IsString,
  Min,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío si se actualiza' })
  @MaxLength(70, { message: 'El nombre no puede tener más de 70 caracteres' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La descripción no puede tener más de 500 caracteres',
  })
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'El precio debe ser mayor o igual a cero' })
  price?: number;

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30, {
    message: 'La categoría no puede tener más de 30 caracteres',
  })
  category?: string;
}
