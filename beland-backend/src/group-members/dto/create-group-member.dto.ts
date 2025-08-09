// src/group-members/dto/create-group-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
  IsNumberString,
  IsIn,
} from 'class-validator';

// DTO for creating a GroupMember entry (used internally by service)
export class CreateGroupMemberDto {
  @ApiProperty({ description: 'ID of the group the user joins' })
  @IsUUID()
  group_id: string;

  @ApiProperty({ description: 'ID of the user joining the group' })
  @IsUUID()
  user_id: string;

  @ApiProperty({
    description: 'Role of the user within the group',
    enum: ['LEADER', 'MEMBER'],
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsIn(['LEADER', 'MEMBER'])
  role?: 'LEADER' | 'MEMBER';
}

// DTO for inviting a user via API (can use email, username, or phone)
export class InviteUserDto {
  @ApiProperty({
    description: 'Email of the user to invite (optional).',
    example: 'invited@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Username of the user to invite (optional).',
    example: 'invited_username',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  username?: string;

  @ApiProperty({
    description: 'Phone number of the user to invite (optional).',
    example: '593991234567', // Example phone number with country code
    required: false,
  })
  @IsOptional()
  @IsNumberString()
  phone?: string;
}
