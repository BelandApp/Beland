// src/groups/dto/update-group.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @ApiProperty({
    description: 'Current group status',
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'],
    example: 'ACTIVE',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'])
  status?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';
}
