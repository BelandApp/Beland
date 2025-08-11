// src/groups/groups.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
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
import { UpdateGroupMemberDto } from 'src/group-members/dto/update-group-member.dto'; // <-- ADDED: Import UpdateGroupMemberDto
import { GroupsRepository } from './groups.repository';

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

      // Create the new group entity
      // Ensure the leader_id is set correctly from the leaderUserEntity
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
   * @param paginationDto Pagination options.
   * @param orderDto Ordering options.
   * @param filterName Optional: Filter by group name.
   * @param filterStatus Optional: Filter by group status.
   * @returns A promise that resolves to an object containing an array of GroupDto and the total count.
   */
  async findAllGroups(
    paginationDto: PaginationDto,
    orderDto: OrderDto,
    filterName?: string,
    filterStatus?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE',
  ): Promise<{ groups: GroupDto[]; total: number }> {
    this.logger.debug(
      `findAllGroups(): Fetching all groups with pagination: ${JSON.stringify(paginationDto)}, order: ${JSON.stringify(orderDto)}, filters: name=${filterName}, status=${filterStatus}`,
    );
    const { groups, total } = await this.groupsRepository.findAllPaginated(
      paginationDto.page,
      paginationDto.limit,
      orderDto.sortBy,
      orderDto.order,
      filterName,
      filterStatus,
    );
    // Transform entities to DTOs for the response
    const groupsDto = plainToInstance(GroupDto, groups);
    return { groups: groupsDto, total };
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
    // Delete the group. TypeORM's onDelete: 'CASCADE' in Group entity will handle
    // cascading deletion of related GroupMembers if configured.
    await this.groupsRepository.deleteGroup(groupId);
    this.logger.log(`deleteGroup(): Group ${groupId} deleted successfully.`);
  }

  /**
   * Invites a user to a specific group, creating a new GroupMember entry.
   * This method handles finding the user by email, username, or phone.
   *
   * @param groupId The ID of the group to invite the user to.
   * @param inviteUserDto DTO containing user identification (email, username, or phone).
   * @returns A promise that resolves to the newly created GroupMemberDto.
   * @throws NotFoundException if the group or invited user is not found.
   * @throws BadRequestException if the user is already a member of the group.
   * @throws InternalServerErrorException if the transaction fails.
   */
  async inviteUserToGroup(
    groupId: string,
    // Ensure this matches the `CreateGroupMemberDto` structure if `InviteUserDto` is an alias for it
    // Or create a new specific DTO for invitation if it truly only contains these fields.
    inviteUserDto: CreateGroupMemberDto, // Changed to CreateGroupMemberDto
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `inviteUserToGroup(): Inviting user to group ${groupId} with data: ${JSON.stringify(inviteUserDto)}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Verify group existence
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
      });
      if (!group) {
        throw new NotFoundException(`Group with ID "${groupId}" not found.`);
      }

      // 2. Find the invited user
      let invitedUser: User | null = null;
      if (inviteUserDto.user_id) {
        // Use user_id from CreateGroupMemberDto
        invitedUser = await this.usersService.findOne(inviteUserDto.user_id);
      }
      // If you still want to support invite by email/username/phone from a *different* DTO
      // you would need separate methods or more complex logic here.
      // For now, assuming inviteUserDto only contains user_id.

      if (!invitedUser) {
        throw new NotFoundException(
          'Invited user not found by provided credentials (user_id).',
        );
      }

      // 3. Check if user is already a member
      const existingMembership = await queryRunner.manager.findOne(
        GroupMember,
        {
          where: { group: { id: groupId }, user: { id: invitedUser.id } },
        },
      );

      if (existingMembership) {
        throw new BadRequestException(
          `User "${invitedUser.email}" is already a member of group "${group.name}".`,
        );
      }

      // 4. Create and save new group membership
      const newMembership = this.groupMembersRepository.create({
        group: group,
        user: invitedUser,
        role: inviteUserDto.role || 'MEMBER', // Use role from DTO or default to MEMBER
      });

      const savedMembership = await queryRunner.manager.save(
        GroupMember,
        newMembership,
      );

      await queryRunner.commitTransaction();
      this.logger.log(
        `inviteUserToGroup(): User ${invitedUser.email} invited to group ${group.name} successfully.`,
      );
      // Return the DTO representation of the new membership, including populated relations
      return plainToInstance(GroupMemberDto, savedMembership, {
        enableCircularCheck: true,
        excludeExtraneousValues: true,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `inviteUserToGroup(): Error during invitation transaction:`,
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
        'Failed to invite user to group due to an internal error.',
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

    // Use the repository to find members, ensuring relations are loaded
    const groupMembers = await this.groupMembersRepository.find({
      where: { group: { id: groupId } }, // Filter by group ID
      relations: ['user', 'group'], // Eager load user details and group details
    });
    // Transform entities to DTOs for the response
    return plainToInstance(GroupMemberDto, groupMembers);
  }

  /**
   * Updates an existing group member's details (e.g., role).
   * @param memberId The ID of the group membership to update.
   * @param updateGroupMemberDto The partial data to update the membership with.
   * @returns A promise that resolves to the updated GroupMemberDto.
   * @throws NotFoundException if the group membership is not found.
   * @throws BadRequestException if business rules are violated (e.g., trying to assign multiple leaders).
   */
  async updateGroupMember(
    memberId: string,
    updateGroupMemberDto: UpdateGroupMemberDto, // Corrected type here
  ): Promise<GroupMemberDto> {
    this.logger.debug(
      `updateGroupMember(): Updating group member with ID: ${memberId} with data: ${JSON.stringify(updateGroupMemberDto)}`,
    );

    const existingMembership = await this.groupMembersRepository.findOne({
      where: { id: memberId },
      relations: ['group', 'user'], // Ensure group and user are loaded for checks
    });

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
      await this.groupMembersRepository.save(existingMembership);
    this.logger.log(
      `updateGroupMember(): Group member ${memberId} updated successfully.`,
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
    const groupMember = await this.groupMembersRepository.findOne({
      where: { id: memberId },
      relations: ['group', 'user'], // Load group and user for checks
    });

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

    await this.groupMembersRepository.delete(memberId);
    this.logger.log(
      `removeGroupMember(): Group member ${memberId} removed successfully.`,
    );
  }
}
