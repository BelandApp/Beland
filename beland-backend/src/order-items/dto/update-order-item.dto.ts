// src/order-items/dto/update-order-item.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateOrderItemDto } from './create-order-item.dto';

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}
