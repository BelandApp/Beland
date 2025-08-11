import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';
import { Type } from 'class-transformer'; // Necesario para @Type(() => Number)
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderDto } from '../../common/dto/order.dto';

// Define el tipo de los nombres de roles válidos para el enum, si no lo tienes ya en otro lugar
type ValidGroupStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';

export class GetGroupsQueryDto extends PaginationDto implements OrderDto {
  // Las propiedades 'page' y 'limit' se heredan de PaginationDto

  @ApiPropertyOptional({
    description: 'Columna por la que ordenar los resultados.',
    example: 'created_at',
    type: String,
    default: 'created_at',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'created_at'; // Columna por defecto para ordenar

  @ApiPropertyOptional({
    description:
      'Dirección de la ordenación (ASC para ascendente, DESC para descendente).',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    type: String,
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC'; // Dirección por defecto

  @ApiPropertyOptional({
    description:
      'Filtrar por nombre del grupo (coincidencia parcial sin distinción de mayúsculas/minúsculas).',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por el estado del grupo.',
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'],
    type: String,
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'])
  status?: ValidGroupStatus;
}
