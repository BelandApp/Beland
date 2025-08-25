// src/testimonies/dto/update-testimony.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTestimonyDto } from './create-testimony.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTestimonyDto extends PartialType(CreateTestimonyDto) {
  @ApiPropertyOptional({ description: 'Estado de aprobación del testimonio.' })
  @IsOptional()
  @IsBoolean({ message: 'is_approved debe ser un valor booleano.' })
  is_approved?: boolean;
}
