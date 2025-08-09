// src/groups/dto/group.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto'; // Ensure this import is correct

export class GroupDto {
  @ApiProperty({ description: 'Unique group ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Group name', example: 'Friends Lunch' })
  name: string;

  @ApiProperty({
    description: 'Meeting location',
    example: 'La Carolina Park',
    nullable: true,
  })
  location: string | null;

  @ApiProperty({
    description: 'Location URL',
    example: 'https://maps.app.goo.gl/example',
    nullable: true,
  })
  location_url: string | null;

  @ApiProperty({
    description: 'Date and time of the meeting (ISO 8601 string)',
    example: '2025-08-15T19:00:00Z',
    nullable: true,
  })
  date_time: Date | null;

  @ApiProperty({ description: 'Group status', example: 'ACTIVE' })
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE';

  @ApiProperty({
    description: 'Group creation date',
    example: '2025-08-01T10:00:00Z',
  })
  created_at: Date;

  @ApiProperty({ description: 'Group leader', type: () => UserDto })
  leader: UserDto;

  @ApiProperty({ description: 'Group members', type: () => [GroupMemberDto] })
  members: GroupMemberDto[];
}
