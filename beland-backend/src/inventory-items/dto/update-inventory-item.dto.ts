// src/inventory-items/dto/update-inventory-item.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateInventoryItemDto } from './create-inventory-item.dto';

export class UpdateInventoryItemDto extends PartialType(
  CreateInventoryItemDto,
) {}
