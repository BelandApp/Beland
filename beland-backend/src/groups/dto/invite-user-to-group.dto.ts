// src/groups/dto/invite-user-to-group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class InviteUserToGroupDto {
  @ApiProperty({
    description: 'Email of the user to invite.',
    example: 'new.member@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format.' })
  @ValidateIf((o) => !o.username && !o.phone) // Require if username and phone are not provided
  email?: string;

  @ApiProperty({
    description: 'Username of the user to invite.',
    example: 'newmember',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username must be a string.' })
  @MinLength(3, { message: 'Username must be at least 3 characters long.' })
  @ValidateIf((o) => !o.email && !o.phone) // Require if email and phone are not provided
  username?: string;

  @ApiProperty({
    description: 'Phone number of the user to invite.',
    example: 1234567890,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Phone number must be a number.' })
  @ValidateIf((o) => !o.email && !o.username) // Require if email and username are not provided
  phone?: number;

  @ApiProperty({
    description:
      'Optional role for the invited user within the group. Defaults to MEMBER.',
    enum: ['LEADER', 'MEMBER'],
    default: 'MEMBER',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Role must be a string.' })
  // No @IsIn validation here, as the service will enforce 'LEADER' | 'MEMBER'
  role?: 'LEADER' | 'MEMBER';
}
