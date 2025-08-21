// src/group-invitations/dto/update-group-invitation.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupInvitationDto } from './create-group-invitation.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { GroupInvitationStatus } from '../entities/group-invitation.entity'; // Importar el enum desde la entidad

export class UpdateGroupInvitationDto extends PartialType(
  CreateGroupInvitationDto,
) {
  @ApiPropertyOptional({
    description: 'Nuevo estado de la invitación',
    enum: GroupInvitationStatus, // Usar el enum importado
  })
  @IsOptional()
  @IsEnum(GroupInvitationStatus) // Usar el enum importado
  status?: GroupInvitationStatus;
}
