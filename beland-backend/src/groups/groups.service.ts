// src/groups/groups.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { GroupsRepository } from './groups.repository';
import { GroupMembersRepository } from '../group-members/group-members.repository';
import { UsersService } from '../users/users.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupDto } from './dto/group.dto';
import { Group } from './entities/group.entity';
import { GroupMember } from '../group-members/entities/group-member.entity';
import { plainToInstance } from 'class-transformer';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { DataSource } from 'typeorm';
import { User } from 'src/users/entities/users.entity';
import { CreateGroupMemberDto } from 'src/group-members/dto/create-group-member.dto';
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto';
import { UpdateGroupMemberDto } from 'src/group-members/dto/update-group-member.dto';
import { GetGroupsQueryDto } from './dto/get-groups-query.dto'; // Import GetGroupsQueryDto

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly groupMembersRepository: GroupMembersRepository,
    private readonly usersService: UsersService,
    private readonly dataSource: DataSource, // Inyectamos DataSource para transacciones
  ) {}

  /**
   * Creates a new group and assigns the specified user as its leader and first member.
   *
   * @param createGroupDto The data for creating the new group.
   * @param leaderId The ID of the user who will be the leader of the group.
   * @returns A promise that resolves to the created group as a GroupDto.
   * @throws NotFoundException if the leader user is not found.
   * @throws InternalServerErrorException if the transaction fails due to an internal error.
   */
  async createGroup(
    createGroupDto: CreateGroupDto,
    leaderId: string,
  ): Promise<GroupDto> {
    this.logger.debug(
      `createGroup(): Attempting to create group for leader ID: ${leaderId}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); // Establece la conexión
    await queryRunner.startTransaction(); // Inicia la transacción

    try {
      // Find the user who will be the leader
      const leaderUserEntity: User = await queryRunner.manager.findOne(User, {
        where: { id: leaderId },
      });
      if (!leaderUserEntity) {
        throw new NotFoundException(
          `Leader user with ID "${leaderId}" not found.`,
        );
      }

      // Check for existing group with the same name (case-insensitive)
      const existingGroup = await this.groupsRepository.findOneByName(
        createGroupDto.name,
      );
      if (existingGroup) {
        throw new ConflictException(
          `Group with name "${createGroupDto.name}" already exists.`,
        );
      }

      // Create the new group entity
      const newGroup = this.groupsRepository.create({
        ...createGroupDto,
        leader_id: leaderUserEntity.id, // Assign the leader's ID
      });

      // Save the group within the transaction
      const savedGroup = await queryRunner.manager.save(Group, newGroup);

      // Create the group membership for the leader
      const leaderMembership = this.groupMembersRepository.create({
        group: savedGroup, // Associate with the newly created group
        user: leaderUserEntity, // Associate with the leader user
        role: 'LEADER', // Set the role as LEADER
      });

      // Save the leader's membership within the transaction
      await queryRunner.manager.save(GroupMember, leaderMembership);

      await queryRunner.commitTransaction(); // Confirma la transacción
      this.logger.log(
        `createGroup(): Group "${savedGroup.name}" (ID: ${savedGroup.id}) created successfully by leader ${leaderId}.`,
      );
      return plainToInstance(GroupDto, savedGroup);
    } catch (error) {
      await queryRunner.rollbackTransaction(); // Deshace la transacción en caso de error
      this.logger.error(
        `createGroup(): Error during group creation transaction for leader ID ${leaderId}:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error; // Re-throw known exceptions
      }
      throw new InternalServerErrorException(
        'Failed to create group due to an internal error.',
      );
    } finally {
      await queryRunner.release(); // Libera el queryRunner
    }
  }

  /**
   * Retrieves a paginated list of all groups, with filtering and sorting options.
   * @param queryDto DTO containing pagination, order, and filter criteria.
   * @returns A promise that resolves to an object containing an array of GroupDto and the total count.
   * @throws InternalServerErrorException for unexpected errors.
   */
  async findAllGroups(
    queryDto: GetGroupsQueryDto,
  ): Promise<{ groups: GroupDto[]; total: number }> {
    this.logger.debug(
      `findAllGroups(): Fetching all groups with query: ${JSON.stringify(queryDto)}`,
    );
    try {
      const { groups, total } = await this.groupsRepository.findAllPaginated(
        { page: queryDto.page, limit: queryDto.limit },
        { sortBy: queryDto.sortBy, order: queryDto.order },
        {
          name: queryDto.name,
          status: queryDto.status,
          leaderId: queryDto.leaderId,
          includeDeleted: queryDto.includeDeleted,
        },
      );
      // Transform entities to DTOs for the response
      const groupsDto = plainToInstance(GroupDto, groups);
      return { groups: groupsDto, total };
    } catch (error) {
      this.logger.error(
        `findAllGroups(): Internal server error fetching groups: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve groups due to an internal error.',
      );
    }
  }

  /**
   * Finds a single group by its ID, including its leader and members.
   * @param groupId The ID of the group to find.
   * @returns The GroupDto entity or throws NotFoundException if not found.
   * @throws NotFoundException if the group is not found.
   */
  async findGroupById(groupId: string): Promise<GroupDto> {
    this.logger.debug(
      `findGroupById(): Searching for group with ID: ${groupId}`,
    );
    const group = await this.groupsRepository.findOneById(groupId);
    if (!group) {
      this.logger.warn(
        `findGroupById(): Group with ID "${groupId}" not found.`,
      );
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }
    // Transform entity to DTO for the response
    return plainToInstance(GroupDto, group);
  }

  /**
   * Updates an existing group. Only the group leader or an ADMIN/SUPERADMIN can update.
   * @param groupId The ID of the group to update.
   * @param updateGroupDto The partial data to update the group with.
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
    // Correctly calling hardDeleteGroup as per your repository's method
    await this.groupsRepository.hardDeleteGroup(groupId);
    this.logger.log(`deleteGroup(): Group ${groupId} deleted successfully.`);
  }

  /**
   * Adds a user as a member to a group based on a CreateGroupMemberDto.
   * This method is called by the controller after resolving the user from an InviteUserDto.
   *
   * @param createGroupMemberDto The DTO containing group_id, user_id, and optional role.
   * @returns The created GroupMemberDto.
   * @throws NotFoundException if the group or invited user is not found.
   * @throws BadRequestException if the user is already a member of the group.
   * @throws InternalServerErrorException if the transaction fails.
   */
  async addGroupMember(
    createGroupMemberDto: CreateGroupMemberDto,
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `addGroupMember(): Adding user ${createGroupMemberDto.user_id} to group ${createGroupMemberDto.group_id}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify group existence and eagerly load members with their user details
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: createGroupMemberDto.group_id },
        relations: ['members', 'leader', 'members.user'], // Eager load members and their associated users
      });
      if (!group) {
        throw new NotFoundException(
          `Group with ID "${createGroupMemberDto.group_id}" not found.`,
        );
      }

      // 2. Find the invited user
      const invitedUser: User | null = await queryRunner.manager.findOne(User, {
        where: { id: createGroupMemberDto.user_id },
      });

      if (!invitedUser) {
        throw new NotFoundException(
          'Invited user not found by provided credentials (user_id).',
        );
      }

      // 3. Check if user is already a member
      const isAlreadyMember = group.members.some(
        (member) => member.user?.id === invitedUser.id, // Use optional chaining to safely access id
      );

      if (isAlreadyMember) {
        throw new ConflictException(
          `User "${invitedUser.email}" is already a member of group "${group.name}".`,
        );
      }

      // 4. Prevent directly setting a new leader via this method unless it's the initial group creation handled by createGroup
      // For promoting a member to leader, use updateGroupMemberRole
      if (
        createGroupMemberDto.role === 'LEADER' &&
        group.leader !== null &&
        group.leader.id !== invitedUser.id
      ) {
        throw new BadRequestException(
          'Cannot directly add a new leader to an existing group via this method. Use the update member role endpoint to promote an existing member.',
        );
      }

      // 5. Create and save new group membership
      const newMembership = this.groupMembersRepository.create({
        group: group,
        user: invitedUser,
        role: createGroupMemberDto.role || 'MEMBER', // Use role from DTO or default to MEMBER
      });

      const savedMembership = await queryRunner.manager.save(
        GroupMember,
        newMembership,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `addGroupMember(): User ${invitedUser.email} added to group ${group.name} successfully.`,
      );
      // Return the DTO representation of the new membership, including populated relations
      return plainToInstance(GroupMemberDto, savedMembership, {
        enableCircularCheck: true,
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `addGroupMember(): Error during adding group member transaction:`,
        error,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to add user to group due to an internal error.',
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Retrieves all members of a specific group.
   * @param groupId The ID of the group whose members to retrieve.
   * @returns A promise that resolves to an array of GroupMemberDto.
   * @throws NotFoundException if the group is not found.
   */
  async getGroupMembers(groupId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `getGroupMembers(): Fetching members for group ID: ${groupId}`,
    );
    const group = await this.groupsRepository.findOneById(groupId); // Ensure group exists
    if (!group) {
      throw new NotFoundException(`Group with ID "${groupId}" not found.`);
    }

    // Correctly calling the method from GroupMembersRepository
    const members =
      await this.groupMembersRepository.findGroupMembersByGroupId(groupId);
    // Ensure plainToInstance handles an array of GroupMember entities to GroupMemberDto
    return plainToInstance(GroupMemberDto, members);
  }

  /**
   * Retrieves all groups a specific user is a member of.
   * @param userId The ID of the user.
   * @returns A promise that resolves to an array of GroupMemberDto.
   * @throws NotFoundException if the user is not found.
   */
  async getUserMemberships(userId: string): Promise<GroupMemberDto[]> {
    this.logger.debug(
      `getUserMemberships(): Fetching memberships for user ID: ${userId}`,
    );
    
    const user = await this.usersService.findUserEntityById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    const memberships = await this.groupMembersRepository.findByUserId(userId);
    return plainToInstance(GroupMemberDto, memberships);
  }

  /**
   * Updates an existing group member's details (e.g., role).
   * @param memberId The ID of the group membership to update.
   * @param updateGroupMemberDto The partial data to update the membership with.
   * @returns A promise that resolves to the updated GroupMemberDto.
   * @throws NotFoundException if the group membership is not found.
   * @throws BadRequestException if business rules are violated (e.g., trying to assign multiple leaders).
   */
  async updateGroupMemberRole(
    memberId: string,
    updateGroupMemberDto: UpdateGroupMemberDto, // Corrected type here
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `updateGroupMemberRole(): Updating group member with ID: ${memberId} with data: ${JSON.stringify(updateGroupMemberDto)}`,
    );

    const existingMembership =
      await this.groupMembersRepository.findOneById(memberId);

    if (!existingMembership) {
      throw new NotFoundException(
        `Group member with ID "${memberId}" not found.`,
      );
    }

    // Business rule: A group can only have one LEADER.
    // If the role is being changed to 'LEADER' and the current role is not 'LEADER',
    // we need to check if there's already a leader in the group.
    if (
      updateGroupMemberDto.role &&
      updateGroupMemberDto.role === 'LEADER' &&
      existingMembership.role !== 'LEADER' // Only apply this check if the role is actually changing to LEADER
    ) {
      const group = await this.groupsRepository.findOneById(
        existingMembership.group.id,
      );
      if (group) {
        // Filter to find other leaders in the group (excluding the current member if they were already a leader)
        const currentLeaders = group.members.filter(
          (m) => m.role === 'LEADER' && m.id !== memberId,
        );
        if (currentLeaders.length > 0) {
          throw new BadRequestException(
            'A group can only have one leader. Please demote the current leader first.',
          );
        }
      }
    }

    // Apply partial updates to the existing membership entity
    Object.assign(existingMembership, updateGroupMemberDto);

    const updatedMembership =
      await this.groupMembersRepository.saveGroupMember(existingMembership);
    this.logger.log(
      `updateGroupMemberRole(): Group member ${memberId} updated successfully.`,
    );
    return plainToInstance(GroupMemberDto, updatedMembership);
  }

  /**
   * Removes a member from a group.
   * @param memberId The ID of the group membership to remove.
   * @returns A promise that resolves when the membership is removed.
   * @throws NotFoundException if the group membership is not found.
   * @throws BadRequestException if specific business rules prevent deletion (e.g., last leader).
   */
  async removeGroupMember(memberId: string): Promise<void> {
    this.logger.debug(
      `removeGroupMember(): Deleting group member with ID: ${memberId}`,
    );
    // Fetch the group member to ensure it exists and to get its role and associated group
    const groupMember = await this.groupMembersRepository.findOneById(memberId); // Using findOneById

    if (!groupMember) {
      throw new NotFoundException(
        `Group member with ID "${memberId}" not found.`,
      );
    }

    // Special rule: Prevent deleting the last LEADER of a group if the group is still active.
    // This logic ensures a group always has a leader or is deleted.
    if (groupMember.role === 'LEADER') {
      const group = await this.groupsRepository.findOneById(
        groupMember.group.id,
      ); // Re-fetch group to get updated members
      if (group) {
        // Filter to find other leaders in the group (excluding the one being removed)
        const leaderMemberships = group.members.filter(
          (m) => m.role === 'LEADER' && m.id !== memberId,
        );
        if (leaderMemberships.length === 0) {
          throw new BadRequestException(
            'Cannot remove the last leader of an active group. Please assign another leader first or delete the group.',
          );
        }
      }
    }

    await this.groupMembersRepository.deleteGroupMember(memberId);
    this.logger.log(
      `removeGroupMember(): Group member ${memberId} deleted successfully.`,
    );
  }
}
