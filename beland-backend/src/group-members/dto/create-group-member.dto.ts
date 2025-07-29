// src/group-members/dto/create-group-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsIn } from 'class-validator';

export class CreateGroupMemberDto {
  @ApiProperty({ description: 'ID del grupo al que se une el usuario' })
  @IsUUID()
  group_id: string;

  @ApiProperty({ description: 'ID del usuario que se une al grupo' })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Rol del usuario dentro del grupo',
    enum: ['LEADER', 'MEMBER'],
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsIn(['LEADER', 'MEMBER'])
  role?: 'LEADER' | 'MEMBER';
}
