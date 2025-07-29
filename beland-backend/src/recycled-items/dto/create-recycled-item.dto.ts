// src/recycled-items/dto/create-recycled-item.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRecycledItemDto {
  @ApiProperty({ description: 'ID del producto reciclado' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'ID del usuario que lo escaneó' })
  @IsUUID()
  scanned_by_user_id: string;
}
