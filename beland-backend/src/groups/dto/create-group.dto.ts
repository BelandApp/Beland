// src/groups/dto/create-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDate,
  IsIn,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ description: 'Nombre del grupo' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Ubicación física del grupo', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'URL de la ubicación (mapa u otro servicio)',
    required: false,
  })
  @IsOptional()
  @IsString()
  location_url?: string;

  @ApiProperty({
    description: 'Fecha y hora del grupo',
    required: false,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  date_time?: Date;

  @ApiProperty({
    description: 'Estado del grupo',
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'],
    required: false,
    default: 'ACTIVE',
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'])
  status?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';

  @ApiProperty({ description: 'ID del usuario líder del grupo' })
  @IsUUID()
  leader_id: string;
}
