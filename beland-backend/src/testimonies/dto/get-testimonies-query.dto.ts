// src/testimonies/dto/get-testimonies-query.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator'; // Importar IsInt, Min
import { Type } from 'class-transformer';
// No necesitamos extender de PaginationDto si definimos limit/offset aquí,
// pero si PaginationDto tiene otras lógicas que quieres heredar, puedes mantenerlo.
// Para este error específico, la re-declaración es la clave.

// Si PaginationDto no tiene otras propiedades o lógica compleja, podrías simplemente no extenderlo y definir todo aquí.
// Sin embargo, por consistencia, mantendremos la extensión y re-declararemos para mayor claridad.
// import { PaginationDto } from 'src/common/dto/pagination.dto'; // Mantenemos si aún se extiende

export class GetTestimoniesQueryDto {
  // Si no extiendes PaginationDto, elimina "extends PaginationDto"

  @ApiPropertyOptional({
    description: 'Límite de resultados por página.',
    default: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1, { message: 'El límite debe ser al menos 1.' })
  @Type(() => Number)
  limit?: number; // Explícitamente declarado

  @ApiPropertyOptional({
    description: 'Número de elementos a omitir (offset).',
    default: 0,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El offset debe ser un número entero.' })
  @Min(0, { message: 'El offset debe ser al menos 0.' })
  @Type(() => Number)
  offset?: number; // Explícitamente declarado

  @ApiPropertyOptional({
    description: 'Filtrar testimonios por ID de usuario que lo creó.',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por testimonios aprobados (true/false).',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) // Asegura la conversión a booleano
  isApproved?: boolean;

  @ApiPropertyOptional({
    description:
      'Incluir testimonios eliminados lógicamente (solo para administradores).',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean) // Asegura la conversión a booleano
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    description:
      'Ordenar por un campo específico (ej. "created_at", "rating").',
    type: String,
    enum: ['created_at', 'rating', 'user.full_name'], // Añadir campos válidos para ordenar
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    description:
      'Orden de clasificación (ASC para ascendente, DESC para descendente).',
    type: String,
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';
}
