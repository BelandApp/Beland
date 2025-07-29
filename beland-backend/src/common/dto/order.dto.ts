import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class OrderDto {
  @ApiProperty({
    description: 'Columna por la que ordenar los resultados.',
    required: false,
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at'; // Columna por defecto para ordenar

  @ApiProperty({
    description:
      'Dirección de la ordenación (ASC para ascendente, DESC para descendente).',
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC'; // Dirección por defecto
}
