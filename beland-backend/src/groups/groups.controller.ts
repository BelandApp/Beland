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
  UseGuards, // Mantener importado, pero la línea de uso estará comentada
  ForbiddenException,
  BadRequestException,
  ParseUUIDPipe,
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
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { OrderDto } from 'src/common/dto/order.dto';
import { InviteUserDto } from 'src/group-members/dto/create-group-member.dto';
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto';

@ApiTags('groups')
@Controller('groups')
// @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // <-- COMENTADO PARA DESACTIVAR AUTENTICACIÓN
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  /**
   * Helper para obtener el ID del usuario.
   * Prioriza el usuario autenticado (req.user.id).
   * Si no hay usuario autenticado (ej. guards comentados para pruebas),
   * intenta obtenerlo de un query parameter 'userId'.
   * Si tampoco está en la query, lanza un error.
   */
  private getUserId(req: Request, queryUserId?: string): string {
    const user = req.user as User;
    if (user && user.id) {
      return user.id;
    }
    if (queryUserId) {
      // En un entorno real, este userId de la query debería ser validado
      // o usado solo para entornos de desarrollo/pruebas muy específicos.
      return queryUserId;
    }
    throw new ForbiddenException(
      'User ID not provided. Please authenticate or provide a userId query parameter for testing.',
    );
  }

  @Post()
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary: 'Create a new group/meeting',
    description:
      'Allows any authenticated user to create a new group. The user creating the group is automatically assigned as the leader and a LEADER member of that group. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
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
  @ApiResponse({
    status: 400,
    description: 'Invalid input data (e.g., missing name).',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (missing or invalid token).',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (user does not have required role/permission).',
  })
  @ApiResponse({
    status: 404,
    description: 'Leader user not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error (e.g., database issue).',
  })
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req, queryUserId);
    return this.groupsService.createGroup(userId, createGroupDto);
  }

  @Post(':groupId/invite')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Invite a user to a group',
    description:
      'Allows the group leader (or an Admin/Superadmin) to invite other users to their group by email, username, or phone. The invited user becomes a MEMBER of the group. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group to invite to',
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
    description:
      'User invited successfully. Returns the updated group details.',
    type: GroupDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input data, or user is already a member, or inviter is not authorized.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (inviter is not the group leader and not an Admin/Superadmin).',
  })
  @ApiResponse({
    status: 404,
    description: 'Group or the user to invite not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'User is already a member of this group.',
  })
  async invite(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req, queryUserId);
    return this.groupsService.inviteUserToGroup(userId, groupId, inviteUserDto);
  }

  @Delete(':groupId/members/:memberId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Remove a member from a group',
    description:
      'Allows the group leader (or an Admin/Superadmin) to remove a member from a group. A leader cannot remove themselves if they are the only leader. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group from which to remove the member',
    type: String,
  })
  @ApiParam({
    name: 'memberId',
    description: 'The ID of the user (member) to remove from the group',
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
    description: 'Member removed successfully (No Content).',
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid request (e.g., trying to remove the last leader, or remover is not authorized).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (remover is not the group leader and not an Admin/Superadmin).',
  })
  @ApiResponse({
    status: 404,
    description: 'Group or member to remove not found.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<void> {
    const userId = this.getUserId(req, queryUserId);
    await this.groupsService.removeGroupMember(userId, groupId, memberId);
  }

  @Get('user-groups')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary:
      'Get all groups the authenticated user is a member of or leader of',
    description:
      'Returns a list of all groups in which the authenticated user is either a leader or a regular member. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
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
    status: 200,
    description: 'List of groups the user belongs to.',
    type: [GroupDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (user does not have required role/permission).',
  })
  async getUserGroups(
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto[]> {
    const userId = this.getUserId(req, queryUserId);
    return this.groupsService.getGroupsByUserId(userId);
  }

  @Get(':groupId/members')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary: 'Get the members of a specific group',
    description:
      'Returns the list of all users who belong to a specific group. Accessible by any member of the group, or an Admin/Superadmin. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group to retrieve members for',
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
    description: 'Forbidden (current user is not a member of the group).',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async getGroupMembers(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupMemberDto[]> {
    const userId = this.getUserId(req, queryUserId);

    const group = await this.groupsService.findGroupById(groupId);

    const isMember = group.members.some((member) => member.user.id === userId);

    const currentUserRole = (req.user as User)?.role_name;

    if (
      !isMember &&
      currentUserRole !== 'ADMIN' &&
      currentUserRole !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException(
        'You do not have permission to view the members of this group.',
      );
    }
    return this.groupsService.getGroupMembers(groupId);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Get all groups (for administrators only)',
    description:
      'Lists all groups registered in the system with pagination and filtering options.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number, starting from 1.',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (max 100).',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Column to sort by (e.g., "name", "created_at").',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order (ASC or DESC).',
    example: 'DESC',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Optional filter by group name (case-insensitive search).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'],
    description: 'Optional filter by group status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of all groups.',
    type: [GroupDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (user does not have ADMIN or SUPERADMIN role).',
  })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() orderDto: OrderDto,
    @Query('name') name?: string,
    @Query('status') status?: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'DELETE',
  ): Promise<{ groups: GroupDto[]; total: number }> {
    return this.groupsService.findAllGroups(
      paginationDto,
      orderDto,
      name,
      status,
    );
  }

  @Get(':groupId')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary: 'Get group details by ID',
    description:
      'Returns detailed information for a specific group. Accessible by any member of the group, or an Admin/Superadmin. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group to retrieve details for',
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
    description: 'Group details.',
    type: GroupDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (current user is not a member of the group).',
  })
  @ApiResponse({ status: 404, description: 'Group not found.' })
  async findOne(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req, queryUserId);

    const group = await this.groupsService.findGroupById(groupId);

    const isMemberOrLeader = group.members.some(
      (member) => member.user.id === userId,
    );
    const currentUserRole = (req.user as User)?.role_name;

    if (
      !isMemberOrLeader &&
      currentUserRole !== 'ADMIN' &&
      currentUserRole !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException(
        'You do not have permission to view the details of this group.',
      );
    }
    return group;
  }

  @Patch(':groupId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Update a group by ID',
    description:
      'Allows the group leader (or an Admin/Superadmin) to update its information (name, location, date, status). For testing without authentication, you can optionally provide a `userId` as a query parameter.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'The ID of the group to update',
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
    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader.id === userId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can update this group.',
      );
    }
    return this.groupsService.updateGroup(groupId, updateGroupDto);
  }

  @Delete(':groupId')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Delete a group by ID',
    description:
      'Deletes a group. Only the group leader or an administrator/superadmin can perform this action. For testing without authentication, you can optionally provide a `userId` as a query parameter.',
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
    @Query('userId') queryUserId?: string,
  ): Promise<void> {
    const userId = this.getUserId(req, queryUserId);
    const group = await this.groupsService.findGroupById(groupId);

    const isCurrentUserLeader = group.leader.id === userId;
    const currentUserRole = (req.user as User)?.role_name;
    const isCurrentUserAdminOrSuperAdmin =
      currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can delete this group.',
      );
    }
    await this.groupsService.deleteGroup(groupId);
  }
}
