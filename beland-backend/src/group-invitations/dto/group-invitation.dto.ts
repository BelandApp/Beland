// src/group-invitations/dto/group-invitation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GroupDto } from 'src/groups/dto/group.dto';
import { UserDto } from 'src/users/dto/user.dto';

export class GroupInvitationDto {
  @ApiProperty({ description: 'ID único de la invitación de grupo' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Grupo al que se invita' })
  @Type(() => GroupDto)
  group: GroupDto;

  @ApiProperty({ description: 'Usuario que envía la invitación' })
  @Type(() => UserDto)
  sender: UserDto;

  @ApiProperty({ description: 'Usuario invitado' })
  @Type(() => UserDto)
  invited_user: UserDto;

  @ApiProperty({
    description: 'Estado de la invitación',
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'],
  })
  @IsEnum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED'])
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';

  @ApiProperty({ description: 'Fecha de creación de la invitación' })
  @IsDateString()
  created_at: Date;

  @ApiProperty({
    description: 'Fecha de actualización de la invitación',
    nullable: true,
  })
  @IsDateString()
  updated_at: Date;

  @ApiProperty({
    description: 'Fecha de expiración de la invitación (opcional)',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  expires_at: Date | null;
}
