// src/group-members/group-members.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { GroupMembersRepository } from './group-members.repository';
import { GroupsRepository } from 'src/groups/group.repository'; // Corrected absolute import path
import { UsersService } from '../users/users.service'; // To find users and check their roles
import { GroupMemberDto } from './dto/group-member.dto';
import { CreateGroupMemberDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { plainToInstance } from 'class-transformer';
import { User } from 'src/users/entities/users.entity'; // Import User entity

@Injectable()
export class GroupMembersService {
  private readonly logger = new Logger(GroupMembersService.name);

  constructor(
    private readonly groupMembersRepository: GroupMembersRepository,
    private readonly groupsRepository: GroupsRepository, // Injected to validate group existence
    private readonly usersService: UsersService, // Injected to validate user existence and roles
  ) {}

  /**
   * Creates a new group membership. This method is primarily for internal use
   * (e.g., by GroupsService when creating a group or inviting a user).
   * Direct API calls for creating memberships should typically go through GroupsService.inviteUserToGroup.
   * @param createGroupMemberDto Data for creating the group member.
   * @returns The created GroupMember as a DTO.
   * @throws NotFoundException if the group or user is not found.
   * @throws ConflictException if the user is already a member of the group.
   */
  async create(
    createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `create(): Attempting to create group member for group ${createGroupMemberDto.group_id} and user ${createGroupMemberDto.user_id}`,
    );

    const group = await this.groupsRepository.findOneById(
      createGroupMemberDto.group_id,
    );
    if (!group) {
      throw new NotFoundException(
        `Group with ID "${createGroupMemberDto.group_id}" not found.`,
      );
    }

    // IMPORTANT: usersService.findOne MUST return a User entity.
    const user = await this.usersService.findOne(createGroupMemberDto.user_id);
    if (!user) {
      throw new NotFoundException(
        `User with ID "${createGroupMemberDto.user_id}" not found.`,
      );
    }

    // Prevent duplicate memberships
    const existingMembership =
      await this.groupMembersRepository.findOneByGroupAndUser(
        createGroupMemberDto.group_id,
        createGroupMemberDto.user_id,
      );
    if (existingMembership) {
      throw new ConflictException(
        `User "${user.email}" is already a member of group "${group.name}".`,
      );
    }

    // Create and save the new group member entity
    const newGroupMember = await this.groupMembersRepository.createGroupMember({
      group: group,
      user: user,
      role: createGroupMemberDto.role || 'MEMBER', // Default to 'MEMBER' if not specified
    });

    this.logger.log(
      `create(): Group member created successfully for user ${user.id} in group ${group.id}.`,
    );
    return plainToInstance(GroupMemberDto, newGroupMember);
  }

  /**
   * Finds a group membership by its unique ID.
   * @param id The ID of the group membership.
   * @returns The GroupMember as a DTO.
   * @throws NotFoundException if the group membership is not found.
   */
  async findOne(id: string): Promise<GroupMemberDto> {
    this.logger.debug(`findOne(): Searching group member with ID: ${id}`);
    // Corrected: Use findOneById method from the repository
    const groupMember = await this.groupMembersRepository.findOneById(id);
    if (!groupMember) {
      throw new NotFoundException(`Group member with ID "${id}" not found.`);
    }
    return plainToInstance(GroupMemberDto, groupMember);
  }

  /**
   * Updates an existing group membership. This can be used, for example, to change a member's role.
   * Authorization checks (e.g., only leader/admin can update) should be handled in the controller.
   * @param id The ID of the group membership to update.
   * @param updateGroupMemberDto Data for updating the group member.
   * @returns The updated GroupMember as a DTO.
   * @throws NotFoundException if the group membership is not found.
   * @throws BadRequestException if attempting to change the associated group or user (these are immutable for a membership).
   */
  async update(
    id: string,
    updateGroupMemberDto: UpdateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(`update(): Updating group member with ID: ${id}`);
    // Corrected: Use findOneById method from the repository
    const existingMembership =
      await this.groupMembersRepository.findOneById(id);
    if (!existingMembership) {
      throw new NotFoundException(`Group member with ID "${id}" not found.`);
    }

    // Prevent changing the group or user associated with the membership, as these define the membership itself.
    if (
      updateGroupMemberDto.group_id &&
      updateGroupMemberDto.group_id !== existingMembership.group.id
    ) {
      throw new BadRequestException(
        'Cannot change the group associated with a group membership.',
      );
    }
    if (
      updateGroupMemberDto.user_id &&
      updateGroupMemberDto.user_id !== existingMembership.user.id
    ) {
      throw new BadRequestException(
        'Cannot change the user associated with a group membership.',
      );
    }

    // Apply partial updates to the existing membership entity
    Object.assign(existingMembership, updateGroupMemberDto);
    const updatedMembership =
      await this.groupMembersRepository.saveGroupMember(existingMembership);
    this.logger.log(`update(): Group member ${id} updated successfully.`);
    return plainToInstance(GroupMemberDto, updatedMembership);
  }

  /**
   * Deletes a group membership by its ID.
   * Authorization checks (e.g., only leader/admin can delete) and specific business rules
   * (e.g., preventing the last leader from being removed) should be handled in the controller.
   * @param id The ID of the group membership to delete.
   * @returns void
   * @throws NotFoundException if the group membership is not found.
   * @throws BadRequestException if specific business rules prevent deletion (e.g., last leader).
   */
  async remove(id: string): Promise<void> {
    this.logger.debug(`remove(): Deleting group member with ID: ${id}`);
    // Corrected: Use findOneById method from the repository
    const groupMember = await this.groupMembersRepository.findOneById(id);
    if (!groupMember) {
      throw new NotFoundException(`Group member with ID "${id}" not found.`);
    }

    // Additional check: Prevent deleting the last LEADER of a group if the group is still active.
    // This check is also in the controller, but having it here adds robustness.
    if (groupMember.role === 'LEADER') {
      const group = await this.groupsRepository.findOneById(
        groupMember.group.id,
      );
      if (group) {
        // Filter to find other leaders in the group (excluding the one being removed)
        const leaderMemberships = group.members.filter(
          (m) => m.role === 'LEADER' && m.id !== id,
        );
        if (leaderMemberships.length === 0) {
          throw new BadRequestException(
            'Cannot remove the last leader of an active group. Please assign another leader first or delete the group.',
          );
        }
      }
    }

    await this.groupMembersRepository.deleteGroupMember(id);
    this.logger.log(`remove(): Group member ${id} deleted successfully.`);
  }
}
