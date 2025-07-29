// src/order-items/dto/create-order-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'ID de la orden relacionada' })
  @IsUUID()
  order_id: string;

  @ApiProperty({ description: 'ID del producto consumido' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Cantidad del producto consumida' })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: 'Precio unitario del producto' })
  @IsNumber()
  unit_price: number;

  @ApiProperty({ description: 'Precio total de la línea del pedido' })
  @IsNumber()
  total_price: number;

  @ApiProperty({
    description: 'ID del usuario que consumió el producto',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  consumed_by_user_id?: string;
}
