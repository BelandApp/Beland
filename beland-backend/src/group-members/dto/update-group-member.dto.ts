// src/group-members/dto/update-group-member.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateGroupMemberDto } from './create-group-member.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateGroupMemberDto extends PartialType(CreateGroupMemberDto) {
  @ApiProperty({
    description: 'Role of the user within the group',
    enum: ['LEADER', 'MEMBER'],
    required: false,
  })
  @IsOptional()
  @IsIn(['LEADER', 'MEMBER'])
  role?: 'LEADER' | 'MEMBER';
}
