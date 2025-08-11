// src/orders/dto/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsOptional, IsNumber } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID del grupo asociado a la orden' })
  @IsUUID()
  group_id: string;

  @ApiProperty({ description: 'ID del líder que inició la orden' })
  @IsUUID()
  leader_id: string;

  @ApiProperty({
    description: 'Estado de la orden',
    enum: ['PENDING', 'PAID'],
    default: 'PENDING',
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID'])
  status?: 'PENDING' | 'PAID';

  @ApiProperty({
    description: 'Total de la orden en monedas internas',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiProperty({
    description: 'Total de la orden en monedas internas',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_items?: number;
}
