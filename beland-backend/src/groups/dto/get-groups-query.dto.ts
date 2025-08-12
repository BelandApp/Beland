import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn, IsBoolean, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { OrderDto } from '../../common/dto/order.dto';

// Define the type of valid group statuses for the enum
type ValidGroupStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';

export class GetGroupsQueryDto extends PaginationDto implements OrderDto {
  // 'page' and 'limit' properties are inherited from PaginationDto

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

  @ApiPropertyOptional({
    description: 'Filtrar por ID del líder del grupo.',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  leaderId?: string; // Added leaderId filter

  @ApiPropertyOptional({
    description:
      'Si se deben incluir grupos eliminados lógicamente (soft-deleted).',
    default: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean) // Needed for boolean transformation from query string
  @IsBoolean()
  includeDeleted?: boolean = false; // Added includeDeleted filter
}
