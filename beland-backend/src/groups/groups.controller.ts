// src/groups/groups.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  ForbiddenException,
  BadRequestException,
  ParseUUIDPipe,
  Logger,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupDto } from './dto/group.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
// Absolute paths for guards and decorators (assuming tsconfig.json is configured)
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator';
import { Request } from 'express';
import { User } from 'src/users/entities/users.entity';
import { GetGroupsQueryDto } from './dto/get-groups-query.dto';
import { InviteUserToGroupDto } from './dto/invite-user-to-group.dto'; // Your existing DTO
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto';
import { UpdateGroupMemberDto } from 'src/group-members/dto/update-group-member.dto';
import { UsersService } from 'src/users/users.service'; // <-- ADDED: Import UsersService
import { CreateGroupMemberDto } from 'src/group-members/dto/create-group-member.dto'; // <-- ADDED: Import CreateGroupMemberDto

@ApiTags('groups') // Tag for Swagger documentation
@Controller('groups')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Apply guards to all routes in this controller
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name); // Initialize logger

  constructor(
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService, // <-- ADDED: Inject UsersService
  ) {}

  /**
   * Helper method to get the user ID from the request.
   * It prioritizes the JWT user ID, then falls back to a query parameter (for testing).
   * @param req The Express request object.
   * @param queryUserId Optional user ID from query parameters.
   * @returns The user ID.
   * @throws ForbiddenException if no user ID can be determined.
   */
  private getUserId(req: Request, queryUserId?: string): string {
    const userId = (req.user as User)?.id || queryUserId;
    if (!userId) {
      this.logger.error(
        'getUserId(): No user ID found in JWT or query parameter.',
      );
      throw new ForbiddenException(
        'User ID not found. Authentication required.',
      );
    }
    return userId;
  }

  @Post()
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA') // All authenticated users can create a group
  @ApiOperation({
    summary: 'Create a new group',
    description:
      'Creates a new group and assigns the authenticated user as its leader and first member.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully.',
    type: GroupDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (user ID not found).' })
  @ApiResponse({ status: 404, description: 'Leader user not found.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups - Creating group by user ID: ${userId}`,
    );
    try {
      const newGroup = await this.groupsService.createGroup(
        createGroupDto,
        userId,
      );
      return newGroup;
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `create(): Error creating group: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `create(): Internal server error creating group: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to create group due to an internal error.',
      );
    }
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN') // Only Admin and Superadmin can get all groups
  @RequiredPermissions('content_permission') // Example: Admins/Superadmins might need a 'content_permission' to view all groups
  @ApiOperation({
    summary: 'Get all groups',
    description:
      'Retrieves a paginated list of all groups, with filtering and sorting options. Only accessible by Admins and Superadmins.',
  })
  @ApiBearerAuth('JWT-auth')
  // Mueve todos los @ApiQuery a un solo @Query()
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number, starting from 1.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (1-100).',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Column to sort by (e.g., created_at, name, status).',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (ASC or DESC).',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by group name (partial match).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'],
    description: 'Filter by group status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of groups.',
    type: [GroupDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (insufficient role/permission).',
  })
  async findAll(
    @Query() queryDto: GetGroupsQueryDto, // Usa el nuevo DTO combinado aquí
  ): Promise<{ groups: GroupDto[]; total: number }> {
    this.logger.log(`🚧 [BACKEND] Ruta /groups - Fetching all groups.`);
    try {
      const { groups, total } = await this.groupsService.findAllGroups(
        // Pasa los parámetros extraídos del DTO combinado
        { page: queryDto.page, limit: queryDto.limit },
        { sortBy: queryDto.sortBy, order: queryDto.order },
        queryDto.name, // filterName
        queryDto.status, // filterStatus
      );
      return { groups, total };
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `findAll(): Error fetching all groups: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `findAll(): Internal server error fetching groups: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve groups due to an internal error.',
      );
    }
  }

  @Get(':groupId')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA') // Authenticated users can view groups they are part of. Admins/Superadmins can view any.
  @ApiOperation({
    summary: 'Get group by ID',
    description:
      'Retrieves details of a specific group. Group leaders and Admins/Superadmins can view any group. Regular members can view groups they are part of.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'ID of the group to retrieve.',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 200,
    description: 'Group found successfully.',
    type: GroupDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not authorized to view this group).',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async findOne(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId - Fetching group with ID: ${groupId} for user ${userId}`,
    );

    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader?.id === userId;
    const isCurrentUserMember = group.members?.some(
      (member) => member.user.id === userId,
    );
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    // Authorization: User must be leader, a member, or an Admin/Superadmin
    if (
      !isCurrentUserLeader &&
      !isCurrentUserMember &&
      !isCurrentUserAdminOrSuperAdmin
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this group. You must be the leader, a member, or an administrator.',
      );
    }

    return group; // Service already returns GroupDto
  }

  @Patch(':groupId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Only group leader or Admin/Superadmin can update a group
  @RequiredPermissions('content_permission') // Admins/Superadmins might need 'content_permission'
  @ApiOperation({
    summary: 'Update a group by ID',
    description:
      'Updates details of a specific group. Only the group leader or an administrator/superadmin can perform this action.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group to update.',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully.',
    type: GroupDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (current user is not the group leader and not an Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async update(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId - Updating group with ID: ${groupId} by user ${userId}`,
    );

    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader?.id === userId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can update group details.',
      );
    }

    try {
      const updatedGroup = await this.groupsService.updateGroup(
        groupId,
        updateGroupDto,
      );
      return updatedGroup;
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        this.logger.warn(
          `update(): Error updating group: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `update(): Internal server error updating group: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to update group due to an internal error.',
      );
    }
  }

  @Delete(':groupId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Only group leader, admin or superadmin can delete a group
  @RequiredPermissions('content_permission') // Admins/Superadmins might need 'content_permission'
  @ApiOperation({
    summary: 'Delete a group by ID',
    description:
      'Deletes a group. Only the group leader or an administrator/superadmin can perform this action.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group to delete',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 204,
    description: 'Group deleted successfully (No Content).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (current user is not the group leader and not an Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async remove(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<void> {
    const userId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId - Deleting group with ID: ${groupId} by user ${userId}`,
    );

    const group = await this.groupsService.findGroupById(groupId); // Fetch group to check leader

    const isCurrentUserLeader = group.leader?.id === userId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can delete this group.',
      );
    }

    try {
      await this.groupsService.deleteGroup(groupId);
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `remove(): Error deleting group: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `remove(): Internal server error deleting group: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to delete group due to an internal error.',
      );
    }
  }

  @Post(':groupId/members')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission')
  @ApiOperation({
    summary: 'Invite a user to a group',
    description:
      'Invites a user to the specified group by email, username, or phone. The invited user will be added as a MEMBER. Only the group leader or an Admin/Superadmin can invite.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'ID of the group to invite the user to.',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 201,
    description: 'User invited to group successfully.',
    type: GroupMemberDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user already a member.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not authorized to invite to this group).',
  })
  @ApiResponse({ status: 404, description: 'Group or invited user not found.' })
  @HttpCode(HttpStatus.CREATED)
  async inviteUser(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() inviteUserDto: InviteUserToGroupDto,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupMemberDto> {
    const currentUserId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members - Inviting user to group ${groupId} by user ${currentUserId}`,
    );

    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader?.id === currentUserId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can invite members to this group.',
      );
    }

    // --- START: Added logic to resolve user and construct CreateGroupMemberDto ---
    let userToInvite: User | null = null;
    if (inviteUserDto.email) {
      userToInvite = await this.usersService.findByEmail(inviteUserDto.email);
    } else if (inviteUserDto.username) {
      userToInvite = await this.usersService.findByUsername(
        inviteUserDto.username,
      );
    } else if (inviteUserDto.phone) {
      // Convert phone to number, as findByPhone expects a number
      userToInvite = await this.usersService.findByPhone(
        Number(inviteUserDto.phone),
      );
    }

    if (!userToInvite) {
      throw new NotFoundException(
        'User not found with the provided email, username, or phone.',
      );
    }

    // Construct CreateGroupMemberDto from resolved user ID and groupId
    const createGroupMemberDto: CreateGroupMemberDto = {
      group_id: groupId,
      user_id: userToInvite.id,
      role: inviteUserDto.role || 'MEMBER', // Default to MEMBER if not specified
    };
    // --- END: Added logic ---

    try {
      // Pass the correctly constructed DTO to the service
      const newMember = await this.groupsService.inviteUserToGroup(
        groupId, // groupId from param
        createGroupMemberDto, // <-- NOW PASSING CreateGroupMemberDto
      );
      return newMember;
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        this.logger.warn(
          `inviteUser(): Error inviting user: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `inviteUser(): Internal server error inviting user: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to invite user to group due to an internal error.',
      );
    }
  }

  @Get(':groupId/members')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN', 'USER', 'EMPRESA') // Leaders and members can see group members. Admins/Superadmins can see all.
  @ApiOperation({
    summary: 'Get all members of a specific group',
    description:
      'Retrieves a list of all members for a given group. Accessible by the group leader, any group member, or an Admin/Superadmin.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'ID of the group to retrieve members from.',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 200,
    description: 'List of group members.',
    type: [GroupMemberDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not authorized to view members of this group).',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async getMembers(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupMemberDto[]> {
    const userId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members - Fetching members for group ${groupId} by user ${userId}`,
    );

    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader?.id === userId;
    const isCurrentUserMember = group.members?.some(
      (member) => member.user.id === userId,
    );
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (
      !isCurrentUserLeader &&
      !isCurrentUserMember &&
      !isCurrentUserAdminOrSuperAdmin
    ) {
      throw new ForbiddenException(
        'You are not authorized to view the members of this group. You must be the leader, a member, or an administrator.',
      );
    }

    try {
      const members = await this.groupsService.getGroupMembers(groupId);
      return members;
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `getMembers(): Error fetching group members: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `getMembers(): Internal server error fetching group members: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve group members due to an internal error.',
      );
    }
  }

  @Patch(':groupId/members/:memberId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission')
  @ApiOperation({
    summary: 'Update a group member (e.g., change role)',
    description:
      'Updates a specific group member. Only the group leader or an Admin/Superadmin can perform this action.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'groupId', description: 'ID of the group.', type: String })
  @ApiParam({
    name: 'memberId',
    description: 'ID of the group member entry.',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 200,
    description: 'Group member updated successfully.',
    type: GroupMemberDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not authorized to update this member).',
  })
  @ApiResponse({ status: 404, description: 'Group or group member not found.' })
  async updateMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() updateGroupMemberDto: UpdateGroupMemberDto,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupMemberDto> {
    const currentUserId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members/:memberId - Updating member ${memberId} in group ${groupId} by user ${currentUserId}`,
    );

    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader?.id === currentUserId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can update group members.',
      );
    }

    try {
      const updatedMember = await this.groupsService.updateGroupMember(
        memberId,
        updateGroupMemberDto,
      );
      return updatedMember;
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        this.logger.warn(
          `updateMember(): Error updating group member: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `updateMember(): Internal server error updating group member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to update group member due to an internal error.',
      );
    }
  }

  @Delete(':groupId/members/:memberId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission')
  @ApiOperation({
    summary: 'Remove a member from a group',
    description:
      'Removes a specific member from a group. Only the group leader or an Admin/Superadmin can perform this action. Cannot remove the last leader of an active group directly.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'groupId', description: 'ID of the group.', type: String })
  @ApiParam({
    name: 'memberId',
    description: 'ID of the group member entry to remove.',
    type: String,
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description:
      'Optional: User ID for testing purposes when authentication is bypassed. Ignored if a JWT is present.',
    example: 'cdbc37a5-fd0e-4f0b-b286-de369fb1e44b',
  })
  @ApiResponse({
    status: 204,
    description: 'Group member removed successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot remove last leader of an active group.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not authorized to remove this member).',
  })
  @ApiResponse({ status: 404, description: 'Group or group member not found.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<void> {
    const currentUserId = this.getUserId(req, queryUserId);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members/:memberId - Removing member ${memberId} from group ${groupId} by user ${currentUserId}`,
    );

    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader?.id === currentUserId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can remove members from this group.',
      );
    }

    try {
      await this.groupsService.removeGroupMember(memberId);
    } catch (error) {
      // Corrected error handling to properly type 'error'
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(
          `removeMember(): Error removing group member: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `removeMember(): Internal server error removing group member: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Failed to remove group member due to an internal error.',
      );
    }
  }
}
