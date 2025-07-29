// src/group-members/dto/update-group-member.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateGroupMemberDto } from './create-group-member.dto';

export class UpdateGroupMemberDto extends PartialType(CreateGroupMemberDto) {}
