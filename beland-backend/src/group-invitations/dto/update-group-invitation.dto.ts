// src/group-invitations/dto/update-group-invitation.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupInvitationDto } from './create-group-invitation.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateGroupInvitationDto extends PartialType(
  CreateGroupInvitationDto,
) {
  @ApiPropertyOptional({
    description: 'Nuevo estado de la invitación',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'],
  })
  @IsOptional()
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'])
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
}
