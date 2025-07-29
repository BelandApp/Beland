// src/actions/dto/create-action.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateActionDto {
  @ApiProperty({ description: 'ID del usuario que realiza la acción' })
  @IsUUID()
  user_id: string;

  @ApiProperty({ description: 'Descripción de la acción' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Hash de transacción en blockchain (si aplica)',
    required: false,
  })
  @IsOptional()
  @IsString()
  transaction_hash?: string;

  @ApiProperty({
    description: 'Número del bloque en la blockchain (si aplica)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  block_number?: number;
}
