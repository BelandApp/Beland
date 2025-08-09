// src/group-members/group-members.controller.ts
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ForbiddenException,
  BadRequestException, // Added BadRequestException import
} from '@nestjs/common';
import { GroupMembersService } from './group-members.service';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { GroupMemberDto } from './dto/group-member.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
// Absolute paths for guards and decorators (assuming tsconfig.json is configured)
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Request } from 'express'; // Import Request from express for req.user
import { User } from 'src/users/entities/users.entity'; // Import User entity for type casting req.user
import { GroupsService } from 'src/groups/groups.service'; // Import GroupsService to check group leader/members

@ApiTags('group-members') // Tag for Swagger documentation
@Controller('group-members') // Base route for this controller
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Apply authentication and authorization guards to all routes
export class GroupMembersController {
  constructor(
    private readonly groupMembersService: GroupMembersService,
    private readonly groupsService: GroupsService, // Injected to perform group-level checks (e.g., if current user is leader)
  ) {}

  // NOTE: Creation of group members is primarily handled by GroupsController (create group, invite user).
  // This controller focuses on managing existing individual memberships.

  @Get(':id')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA') // Accessible by any group member or admin roles
  @ApiOperation({
    summary: 'Get a group membership by ID',
    description:
      'Retrieves the details of a specific group membership. Accessible by any member of the group associated with the membership, or by an Admin/Superadmin.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the group membership to retrieve',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Group membership found.',
    type: GroupMemberDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (current user is not a member of the group and not an Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Group membership not found.' })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<GroupMemberDto> {
    const currentUser = req.user as User;
    const membership = await this.groupMembersService.findOne(id); // Get the membership details (now includes group and user entities)

    // Verify if the current user is part of the group associated with this membership or an admin/superadmin
    // Access membership.group.id directly from the DTO, as it's now included
    const group = await this.groupsService.findGroupById(membership.group.id); // Get the associated group (as DTO)
    const isMemberOfThisGroup = group.members.some(
      (member) => member.user.id === currentUser.id,
    );

    if (
      !isMemberOfThisGroup &&
      currentUser.role_name !== 'ADMIN' &&
      currentUser.role_name !== 'SUPERADMIN'
    ) {
      throw new ForbiddenException(
        'You do not have permission to view this group membership.',
      );
    }

    return membership;
  }

  @Patch(':id')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Only leader, admin or superadmin can update a membership
  @ApiOperation({
    summary: 'Update a group membership by ID',
    description:
      'Modifies the role of a member within a group (e.g., promote to LEADER, demote to MEMBER). Only accessible by the group leader, or an Admin/Superadmin. A leader cannot demote themselves if they are the only leader.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the group membership to update',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Group membership updated successfully.',
    type: GroupMemberDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input data (e.g., trying to change group/user, or demoting last leader).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (current user is not the group leader and not an Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Group membership not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateGroupMemberDto: UpdateGroupMemberDto,
    @Req() req: Request,
  ): Promise<GroupMemberDto> {
    const currentUser = req.user as User;
    const membershipToUpdate = await this.groupMembersService.findOne(id); // Get the membership to update (now includes group and user entities)

    // Get the group related to this membership to perform leader/admin checks
    // Access membershipToUpdate.group.id directly from the DTO
    const group = await this.groupsService.findGroupById(
      membershipToUpdate.group.id,
    );

    // Check if current user is the group leader or an Admin/Superadmin
    const isCurrentUserLeader = group.leader.id === currentUser.id;
    const isCurrentUserAdminOrSuperAdmin =
      currentUser.role_name === 'ADMIN' ||
      currentUser.role_name === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can update group memberships.',
      );
    }

    // Special rule: Prevent a leader from demoting themselves if they are the only leader
    if (
      membershipToUpdate.role === 'LEADER' &&
      updateGroupMemberDto.role === 'MEMBER' &&
      membershipToUpdate.user.id === currentUser.id
    ) {
      const currentGroupMembers = await this.groupsService.getGroupMembers(
        group.id,
      );
      const otherLeaders = currentGroupMembers.filter(
        (m) => m.role === 'LEADER' && m.id !== id,
      );
      if (otherLeaders.length === 0) {
        throw new BadRequestException(
          'Cannot demote yourself if you are the only leader of the group. Please assign another leader first.',
        );
      }
    }

    return this.groupMembersService.update(id, updateGroupMemberDto);
  }

  @Delete(':id')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Only leader, admin or superadmin can delete a membership
  @ApiOperation({
    summary: 'Delete a group membership by ID',
    description:
      'Deletes a specific group membership. Only accessible by the group leader, or an Admin/Superadmin. Note: A leader cannot remove themselves if they are the only leader of the group.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'The unique ID of the group membership to delete',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Group membership deleted successfully (No Content).',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (e.g., trying to remove the last leader).',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden (current user is not the group leader and not an Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Group membership not found.' })
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content for successful deletion
  async remove(@Param('id') id: string, @Req() req: Request): Promise<void> {
    const currentUser = req.user as User;
    const membershipToDelete = await this.groupMembersService.findOne(id); // Get the membership to delete (now includes group and user entities)

    // Get the group related to this membership to perform leader/admin checks
    // Access membershipToDelete.group.id directly from the DTO
    const group = await this.groupsService.findGroupById(
      membershipToDelete.group.id,
    );

    // Check if current user is the group leader or an Admin/Superadmin
    const isCurrentUserLeader = group.leader.id === currentUser.id;
    const isCurrentUserAdminOrSuperAdmin =
      currentUser.role_name === 'ADMIN' ||
      currentUser.role_name === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Only the group leader or an administrator can remove group memberships.',
      );
    }

    // Special rule: Prevent deleting the last LEADER of a group if the group is still active
    if (membershipToDelete.role === 'LEADER') {
      const currentGroupMembers = await this.groupsService.getGroupMembers(
        group.id,
      );
      const leaderMemberships = currentGroupMembers.filter(
        (m) => m.role === 'LEADER' && m.id !== id,
      );
      if (leaderMemberships.length === 0) {
        throw new BadRequestException(
          'Cannot remove the last leader of an active group. Please assign another leader first or delete the group.',
        );
      }
    }

    await this.groupMembersService.remove(id);
  }
}
