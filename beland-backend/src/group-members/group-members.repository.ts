// src/group-members/group-members.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GroupMember } from './entities/group-member.entity';

@Injectable()
export class GroupMembersRepository extends Repository<GroupMember> {
  private readonly logger = new Logger(GroupMembersRepository.name);

  constructor(
    @InjectRepository(GroupMember)
    private readonly groupMemberORMRepository: Repository<GroupMember>,
    private dataSource: DataSource,
  ) {
    super(GroupMember, dataSource.createEntityManager());
  }

  /**
   * Finds a single group membership by group ID and user ID.
   * Includes the associated user details to provide complete information about the member.
   * @param groupId The ID of the group.
   * @param userId The ID of the user.
   * @returns The GroupMember entity or null if not found.
   */
  async findOneByGroupAndUser(
    groupId: string,
    userId: string,
  ): Promise<GroupMember | null> {
    return this.groupMemberORMRepository.findOne({
      where: {
        group: { id: groupId }, // Filter by group ID
        user: { id: userId }, // Filter by user ID
      },
      relations: ['user', 'group'], // Eager load user and group details for the membership
    });
  }

  /**
   * Finds a single group membership by its primary ID.
   * Includes the associated user and group details.
   * Renamed from `findOne` to `findOneById` to avoid conflicts with TypeORM's base Repository `findOne` method.
   * @param id The primary ID of the group membership.
   * @returns The GroupMember entity or null if not found.
   */
  async findOneById(id: string): Promise<GroupMember | null> {
    // Renamed from findOne
    return this.groupMemberORMRepository.findOne({
      where: { id: id },
      relations: ['user', 'group'],
    });
  }

  /**
   * Finds all members of a specific group, including their user details.
   * This is useful for listing all participants in a meeting.
   * @param groupId The ID of the group.
   * @returns A list of GroupMember entities.
   */
  async findMembersByGroupId(groupId: string): Promise<GroupMember[]> {
    return this.groupMemberORMRepository.find({
      where: { group: { id: groupId } },
      relations: ['user'], // Load user details for each member
    });
  }

  /**
   * Saves a GroupMember entity to the database. This method can be used for both creating new memberships
   * and updating existing ones (e.g., changing a member's role).
   * @param groupMember The GroupMember entity to save.
   * @returns The saved GroupMember entity.
   */
  async saveGroupMember(groupMember: GroupMember): Promise<GroupMember> {
    return this.groupMemberORMRepository.save(groupMember);
  }

  /**
   * Creates a new GroupMember entity instance and saves it to the database.
   * This is typically used when a user is initially added to a group.
   * @param groupMemberPartial Partial GroupMember entity data.
   * @returns The created GroupMember entity.
   */
  async createGroupMember(
    groupMemberPartial: Partial<GroupMember>,
  ): Promise<GroupMember> {
    const newGroupMember =
      this.groupMemberORMRepository.create(groupMemberPartial);
    return this.groupMemberORMRepository.save(newGroupMember);
  }

  /**
   * Deletes a group membership by its ID.
   * @param id The ID of the group membership to delete.
   */
  async deleteGroupMember(id: string): Promise<void> {
    await this.groupMemberORMRepository.delete(id);
  }

  /**
   * Deletes a group membership by group ID and user ID.
   * This is an alternative way to remove a member if you don't have the membership ID directly.
   * @param groupId The ID of the group.
   * @param userId The ID of the user whose membership to delete.
   */
  async deleteGroupMemberByGroupAndUser(
    groupId: string,
    userId: string,
  ): Promise<void> {
    await this.groupMemberORMRepository.delete({
      group: { id: groupId },
      user: { id: userId },
    });
  }
}
