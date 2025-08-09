// src/groups/groups.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupsRepository } from 'src/groups/group.repository'; // Corrected absolute import path (singular)
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { UsersService } from '../users/users.service'; // Used to find users by email/username/phone and check roles
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupDto } from './dto/group.dto';
import { Group } from './entities/group.entity';
import { GroupMember } from '../group-members/entities/group-member.entity';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { DataSource } from 'typeorm'; // For managing transactions
import { User } from 'src/users/entities/users.entity'; // Import User entity
import { InviteUserDto } from 'src/group-members/dto/create-group-member.dto'; // DTO for inviting users
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto'; // DTO for group member responses

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMembersRepository: GroupMembersRepository,
    private readonly usersService: UsersService, // Injected to access user-related operations
    private readonly dataSource: DataSource, // Injected for transaction management
  ) {}

  /**
   * Creates a new group and automatically assigns the requesting user as its leader.
   * This operation is wrapped in a transaction to ensure atomicity:
   * if either the group creation or the leader's membership fails, both are rolled back.
   * @param userId The ID of the user creating the group.
   * @param createGroupDto Data for creating the group.
   * @returns The created group as a GroupDto.
   * @throws NotFoundException if the creating user is not found.
   * @throws InternalServerErrorException for unexpected database errors.
   */
  async createGroup(
    userId: string,
    createGroupDto: CreateGroupDto,
  ): Promise<GroupDto> {
    this.logger.debug(
      `createGroup(): Attempting to create group by user ID: ${userId}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the user who is creating the group to assign them as the leader
      // IMPORTANT: usersService.findOne MUST return a User entity, not a UserDto for internal use.
      const leaderUser = await this.usersService.findOne(userId);
      if (!leaderUser) {
        throw new NotFoundException(`User with ID "${userId}" not found.`);
      }

      // 1. Create the Group entity with the leader assigned
      const newGroup = queryRunner.manager.create(Group, {
        ...createGroupDto,
        leader: leaderUser, // Assign the user as the leader of this new group
        status: createGroupDto.status || 'ACTIVE', // Default status to 'ACTIVE' if not provided
      });

      const savedGroup = await queryRunner.manager.save(newGroup);
      this.logger.log(
        `createGroup(): Group "${savedGroup.name}" (ID: ${savedGroup.id}) created.`,
      );

      // 2. Create the GroupMember entry for the leader with the role 'LEADER'
      const leaderMembership = queryRunner.manager.create(GroupMember, {
        group: savedGroup, // Link to the newly created group
        user: leaderUser, // Link to the leader user
        role: 'LEADER', // Explicitly set their role within this group as LEADER
      });
      await queryRunner.manager.save(leaderMembership);
      this.logger.log(
        `createGroup(): Leader membership created for group ${savedGroup.id}.`,
      );

      await queryRunner.commitTransaction(); // Commit both operations if successful
      this.logger.log(
        `createGroup(): Group creation transaction completed successfully.`,
      );

      // Retrieve the newly created group with all its relations (leader and members)
      // to ensure the returned DTO is fully populated.
      const groupWithRelations = await this.groupsRepository.findOneById(
        savedGroup.id,
      );
      return plainToInstance(GroupDto, groupWithRelations);
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction(); // Rollback if any error occurs
      this.logger.error(
        `createGroup(): Error during group creation transaction for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined, // Log stack trace for debugging
      );
      // Re-throw specific exceptions for controller to handle
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create group due to an internal error.',
      );
    } finally {
      await queryRunner.release(); // Release the query runner connection
    }
  }

  /**
   * Invites a user to a group. This action can only be performed by the group leader,
   * or by an ADMIN/SUPERADMIN. The invited user is added as a 'MEMBER'.
   * The invited user can be identified by email, username, or phone number.
   * @param inviterId The ID of the user performing the invitation.
   * @param groupId The ID of the group to invite to.
   * @param inviteUserDto Data for identifying the user to invite (email, username, or phone).
   * @returns The updated group as a GroupDto, including the new member.
   * @throws NotFoundException if the group or invited user is not found.
   * @throws BadRequestException if the inviter is not authorized or if the invited user is already the leader.
   * @throws ConflictException if the invited user is already a member of the group.
   */
  async inviteUserToGroup(
    inviterId: string,
    groupId: string,
    inviteUserDto: InviteUserDto,
  ): Promise<GroupDto> {
    this.logger.debug(
      `inviteUserToGroup(): Attempting to invite user to group ${groupId} by inviter ${inviterId}`,
    );

    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    // Determine if the inviter is the group's direct leader or an Admin/Superadmin
    // IMPORTANT: usersService.findOne MUST return a User entity.
    const inviterUser = await this.usersService.findOne(inviterId);
    if (!inviterUser) {
      throw new NotFoundException(
        `Inviter user with ID "${inviterId}" not found.`,
      );
    }

    const isInviterLeader = group.leader.id === inviterId;
    const isInviterAdminOrSuperAdmin =
      inviterUser.role_name === 'ADMIN' ||
      inviterUser.role_name === 'SUPERADMIN';

    // Enforce authorization: only leader, admin, or superadmin can invite
    if (!isInviterLeader && !isInviterAdminOrSuperAdmin) {
      throw new BadRequestException(
        'Only the group leader or an administrator can invite members.',
      );
    }

    // Find the invited user using the provided criteria (email, username, or phone)
    let invitedUser: User | null = null;
    if (inviteUserDto.email) {
      invitedUser = await this.usersService.findByEmail(inviteUserDto.email);
    } else if (inviteUserDto.username) {
      // Ensure UsersService has findByUsername method that returns User entity
      invitedUser = await this.usersService.findByUsername(
        inviteUserDto.username,
      );
    } else if (inviteUserDto.phone) {
      // Ensure UsersService has findByPhone method that returns User entity
      // Ensure the phone number is correctly parsed to a number if your DB column is numeric
      invitedUser = await this.usersService.findByPhone(
        Number(inviteUserDto.phone),
      );
    }

    if (!invitedUser) {
      throw new NotFoundException(
        'Invited user not found by the provided criteria.',
      );
    }

    // Prevent inviting the group leader themselves (they are already a LEADER member)
    if (invitedUser.id === group.leader.id) {
      throw new BadRequestException(
        'The group leader is already a member of this group.',
      );
    }

    // Check if the invited user is already a member of this group to prevent duplicates
    const existingMembership =
      await this.groupMembersRepository.findOneByGroupAndUser(
        groupId,
        invitedUser.id,
      );
    if (existingMembership) {
      throw new ConflictException(
        `User "${invitedUser.email || invitedUser.username || invitedUser.phone}" is already a member of this group.`,
      );
    }

    // Create a new GroupMember entry for the invited user with the role 'MEMBER'
    // AWAIT the result of createGroupMember as it returns a Promise
    const newMembership = await this.groupMembersRepository.createGroupMember({
      group: group,
      user: invitedUser,
      role: 'MEMBER', // Invited users are regular members by default
    });

    // No need to save again if createGroupMember already saves it
    // await this.groupMembersRepository.saveGroupMember(newMembership);
    this.logger.log(
      `inviteUserToGroup(): User "${invitedUser.email || invitedUser.username}" invited to group "${group.name}".`,
    );

    // Fetch the updated group to return the latest list of members
    const updatedGroup = await this.groupsRepository.findOneById(groupId);
    return plainToInstance(GroupDto, updatedGroup);
  }

  /**
   * Removes a member from a group. This action can only be performed by the group leader,
   * or by an ADMIN/SUPERADMIN.
   * A leader cannot remove themselves if they are the only leader of the group.
   * @param removerId The ID of the user performing the removal.
   * @param groupId The ID of the group from which to remove the member.
   * @param memberId The ID of the user (member) to remove from the group.
   * @throws NotFoundException if the group, remover, or member is not found, or if the member is not part of the group.
   * @throws BadRequestException if the remover is not authorized or if a leader tries to remove themselves as the last leader.
   */
  async removeGroupMember(
    removerId: string,
    groupId: string,
    memberId: string,
  ): Promise<void> {
    this.logger.debug(
      `removeGroupMember(): Attempting to remove member ${memberId} from group ${groupId} by ${removerId}`,
    );

    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    // IMPORTANT: usersService.findOne MUST return a User entity.
    const removerUser = await this.usersService.findOne(removerId);
    const memberToRemoveUser = await this.usersService.findOne(memberId);

    if (!removerUser || !memberToRemoveUser) {
      throw new NotFoundException('Remover or member user not found.');
    }

    // Find the membership entry for the user to be removed
    const memberToRemoveMembership =
      await this.groupMembersRepository.findOneByGroupAndUser(
        groupId,
        memberId,
      );
    if (!memberToRemoveMembership) {
      throw new NotFoundException(
        `User "${memberToRemoveUser.email}" is not a member of group "${group.name}".`,
      );
    }

    // Check if the remover has permission: must be the group leader or an Admin/Superadmin
    const isRemoverLeader = group.leader.id === removerId;
    const isRemoverAdminOrSuperAdmin =
      removerUser.role_name === 'ADMIN' ||
      removerUser.role_name === 'SUPERADMIN';

    if (!isRemoverLeader && !isRemoverAdminOrSuperAdmin) {
      throw new BadRequestException(
        'Only the group leader or an administrator can remove members.',
      );
    }

    // Special rule: Prevent a leader from removing themselves if they are the only leader
    if (
      memberToRemoveMembership.role === 'LEADER' &&
      memberToRemoveUser.id === removerId
    ) {
      const currentGroupMembers =
        await this.groupMembersRepository.findMembersByGroupId(groupId);
      const otherLeaders = currentGroupMembers.filter(
        (m) => m.role === 'LEADER' && m.user.id !== memberToRemoveUser.id,
      );
      if (otherLeaders.length === 0) {
        throw new BadRequestException(
          'The group leader cannot remove themselves if they are the only leader. Please assign another leader first or delete the group.',
        );
      }
    }

    // Perform the deletion of the group membership
    await this.groupMembersRepository.deleteGroupMember(
      memberToRemoveMembership.id,
    );
    this.logger.log(
      `removeGroupMember(): Member ${memberId} removed from group ${groupId} successfully.`,
    );
  }

  /**
   * Retrieves all groups a specific user is a member of (as leader or regular member).
   * This provides a comprehensive list of all groups a user is involved in.
   * @param userId The ID of the user.
   * @returns A list of groups as GroupDto.
   */
  async getGroupsByUserId(userId: string): Promise<GroupDto[]> {
    this.logger.debug(
      `getGroupsByUserId(): Searching groups for user ID: ${userId}`,
    );
    const groups = await this.groupsRepository.findGroupsByUserId(userId);
    this.logger.log(
      `getGroupsByUserId(): Found ${groups.length} groups for user ${userId}.`,
    );
    // Transform the retrieved entities (array of Group) into DTOs (array of GroupDto) for consistent API response
    return plainToInstance(GroupDto, groups) as GroupDto[]; // Added explicit casting
  }

  /**
   * Retrieves all members of a specific group.
   * This is used to display who belongs to a particular meeting or group.
   * @param groupId The ID of the group.
   * @returns A list of group members as GroupMemberDto.
   * @throws NotFoundException if the group is not found.
   */
  async getGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `getGroupMembers(): Searching members for group ID: ${groupId}`,
    );
    // First, ensure the group exists
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }
    const members =
      await this.groupMembersRepository.findMembersByGroupId(groupId);
    this.logger.log(
      `getGroupMembers(): Found ${members.length} members for group ${groupId}.`,
    );
    // Transform the retrieved entities (array of GroupMember) into DTOs (array of GroupMemberDto)
    return plainToInstance(GroupMemberDto, members) as GroupMemberDto[]; // Added explicit casting
  }

  /**
   * Retrieves all groups in the system with pagination, ordering, and optional filters.
   * This endpoint is typically for administrative purposes.
   * @param paginationOptions Pagination parameters.
   * @param orderOptions Ordering parameters.
   * @param filterName Optional filter by group name.
   * @param filterStatus Optional filter by group status.
   * @returns A paginated list of groups as GroupDto, along with the total count.
   */
  async findAllGroups(
    paginationOptions: PaginationDto,
    orderOptions: OrderDto,
    filterName?: string,
    filterStatus?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE',
  ): Promise<{ groups: GroupDto[]; total: number }> {
    this.logger.debug(`findAllGroups(): Searching all groups.`);
    const { groups, total } = await this.groupsRepository.findAllPaginated(
      paginationOptions,
      orderOptions,
      filterName,
      filterStatus,
    );
    this.logger.log(`findAllGroups(): Found ${total} groups.`);
    // Transform the array of Group entities into an array of GroupDto
    return { groups: plainToInstance(GroupDto, groups) as GroupDto[], total }; // Added explicit casting
  }

  /**
   * Retrieves a single group by its ID.
   * @param groupId The ID of the group.
   * @returns The group as a GroupDto.
   * @throws NotFoundException if the group is not found.
   */
  async findGroupById(groupId: string): Promise<GroupDto> {
    this.logger.debug(`findGroupById(): Searching group with ID: ${groupId}`);
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }
    return plainToInstance(GroupDto, group);
  }

  /**
   * Updates an existing group. Only the group leader or an ADMIN/SUPERADMIN can update.
   * @param groupId The ID of the group to update.
   * @param updateGroupDto Data for updating the group.
   * @returns The updated group as a GroupDto.
   * @throws NotFoundException if the group is not found.
   */
  async updateGroup(
    groupId: string,
    updateGroupDto: UpdateGroupDto,
  ): Promise<GroupDto> {
    this.logger.debug(`updateGroup(): Updating group with ID: ${groupId}`);
    const existingGroup = await this.groupsRepository.findOneById(groupId);
    if (!existingGroup) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    // Apply partial updates to the existing group entity
    Object.assign(existingGroup, updateGroupDto);
    const updatedGroup = await this.groupsRepository.saveGroup(existingGroup);
    this.logger.log(`updateGroup(): Group ${groupId} updated successfully.`);
    return plainToInstance(GroupDto, updatedGroup);
  }

  /**
   * Deletes a group. Only the group leader or an ADMIN/SUPERADMIN can delete.
   * @param groupId The ID of the group to delete.
   * @throws NotFoundException if the group is not found.
   */
  async deleteGroup(groupId: string): Promise<void> {
    this.logger.debug(`deleteGroup(): Deleting group with ID: ${groupId}`);
    const group = await this.groupsRepository.findOneById(groupId); // Fetch to ensure existence
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }
    await this.groupsRepository.deleteGroup(groupId);
    this.logger.log(`deleteGroup(): Group ${groupId} deleted successfully.`);
  }
}
