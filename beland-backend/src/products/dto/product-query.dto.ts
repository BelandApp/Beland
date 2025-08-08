// src/products/dto/product-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { Product } from '../entities/product.entity';

export class ProductQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página. Empieza en 1.',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página.',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Columna para ordenar resultados.',
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: keyof Product = 'created_at';

  @ApiPropertyOptional({
    description: 'Dirección de orden: ASC o DESC.',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
  @IsString()
  name?: string;
}
