// src/actions/dto/update-action.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateActionDto } from './create-action.dto';

export class UpdateActionDto extends PartialType(CreateActionDto) {}
