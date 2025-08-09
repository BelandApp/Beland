// src/group-members/dto/group-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from 'src/users/dto/user.dto';
import { GroupDto } from 'src/groups/dto/group.dto'; // Import GroupDto

export class GroupMemberDto {
  @ApiProperty({ description: 'Unique group membership ID', example: 'uuid' })
  id: string;

  @ApiProperty({
    description: 'Member role in the group',
    example: 'MEMBER',
    enum: ['LEADER', 'MEMBER'],
  })
  role: 'LEADER' | 'MEMBER';

  @ApiProperty({
    description: 'Date joined the group',
    example: '2025-08-01T10:00:00Z',
  })
  joined_at: Date;

  @ApiProperty({ description: 'Member user information', type: () => UserDto })
  user: UserDto;

  // Added group information to the DTO for easier access in controllers/services
  @ApiProperty({ description: 'Group information', type: () => GroupDto })
  group: GroupDto;
}
