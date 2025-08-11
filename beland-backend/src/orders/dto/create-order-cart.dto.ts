// src/orders/dto/create-order.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateOrderByCartDto {
  @ApiProperty({ description: 'ID del grupo asociado a la orden' })
  @IsUUID()
  wallet_id: string;

  @ApiProperty({ description: 'ID del líder que inició la orden' })
  @IsUUID()
  cart_id: string;

}
