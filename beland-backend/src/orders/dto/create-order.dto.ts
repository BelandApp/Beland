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
    enum: ['PENDING_PAYMENT', 'PAID'],
    default: 'PENDING_PAYMENT',
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDING_PAYMENT', 'PAID'])
  status?: 'PENDING_PAYMENT' | 'PAID';

  @ApiProperty({
    description: 'Total de la orden en monedas internas',
    default: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  total_amount?: number;
}
