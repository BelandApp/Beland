// src/recycled-items/dto/update-recycled-item.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRecycledItemDto } from './create-recycled-item.dto';

export class UpdateRecycledItemDto extends PartialType(CreateRecycledItemDto) {}
