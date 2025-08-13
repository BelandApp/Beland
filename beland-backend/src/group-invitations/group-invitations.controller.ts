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
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { GroupInvitationsService } from './group-invitations.service';
import { CreateGroupInvitationDto } from './dto/create-group-invitation.dto';
import { GroupInvitationDto } from './dto/group-invitation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Request } from 'express';
import { User } from 'src/users/entities/users.entity';

@ApiTags('group-invitations')
@Controller('group-invitations')
@UseGuards(FlexibleAuthGuard) // Aplicar autenticación a todo el controlador
export class GroupInvitationsController {
  private readonly logger = new Logger(GroupInvitationsController.name);

  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
  ) {}

  // Helper para obtener el ID del usuario de la request
  private getUserId(req: Request): string {
    const user = req.user as User;
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User not authenticated or ID not found.',
      );
    }
    return user.id;
  }

  @Post()
  @ApiOperation({ summary: 'Crea y envía una nueva invitación a un grupo.' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Invitación creada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 404,
    description: 'Grupo o usuario invitado no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe una invitación pendiente o el usuario ya es miembro.',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() createInvitationDto: CreateGroupInvitationDto,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const senderId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations - Enviando invitación del usuario ${senderId} al grupo ${createInvitationDto.group_id}`,
    );
    try {
      return await this.groupInvitationsService.createInvitation(
        createInvitationDto,
        senderId,
      );
    } catch (error) {
      this.logger.warn(
        `create(): Error al enviar invitación: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  @Get('my-pending')
  @ApiOperation({
    summary:
      'Obtiene todas las invitaciones PENDIENTES recibidas por el usuario autenticado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones pendientes.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMyPendingInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-pending - Buscando invitaciones pendientes para el usuario ${userId}`,
    );
    return this.groupInvitationsService.findUserPendingInvitations(userId);
  }

  @Get('my-accepted')
  @ApiOperation({
    summary:
      'Obtiene todas las invitaciones ACEPTADAS por el usuario autenticado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones aceptadas.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMyAcceptedInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-accepted - Buscando invitaciones aceptadas para el usuario ${userId}`,
    );
    return this.groupInvitationsService.findUserAcceptedInvitations(userId);
  }

  @Get('my-rejected')
  @ApiOperation({
    summary:
      'Obtiene todas las invitaciones RECHAZADAS por el usuario autenticado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones rechazadas.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMyRejectedInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-rejected - Buscando invitaciones rechazadas para el usuario ${userId}`,
    );
    return this.groupInvitationsService.findUserRejectedInvitations(userId);
  }

  @Get('my-canceled')
  @ApiOperation({
    summary:
      'Obtiene todas las invitaciones CANCELADAS (por el remitente) donde el usuario autenticado fue el invitado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones canceladas.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMyCanceledInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-canceled - Buscando invitaciones canceladas para el usuario ${userId}`,
    );
    return this.groupInvitationsService.findUserCanceledInvitations(userId);
  }

  @Get('my-expired')
  @ApiOperation({
    summary:
      'Obtiene todas las invitaciones EXPIRADAS donde el usuario autenticado fue el invitado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones expiradas.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMyExpiredInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-expired - Buscando invitaciones expiradas para el usuario ${userId}`,
    );
    return this.groupInvitationsService.findUserExpiredInvitations(userId);
  }

  @Get('my-soft-deleted')
  @ApiOperation({
    summary:
      'Obtiene todas las invitaciones SOFT-DELETED (eliminadas lógicamente) donde el usuario autenticado fue el invitado.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones soft-deleted.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findMySoftDeletedInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-soft-deleted - Buscando invitaciones soft-deleted para el usuario ${userId}`,
    );
    return this.groupInvitationsService.findUserSoftDeletedInvitations(userId);
  }

  @Patch(':invitationId/accept')
  @ApiOperation({ summary: 'Acepta una invitación a grupo.' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Invitación aceptada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La invitación no está pendiente o ha expirado.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para aceptar esta invitación.',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya es miembro del grupo.',
  })
  async acceptInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const acceptingUserId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/${invitationId}/accept - Aceptando invitación por el usuario ${acceptingUserId}`,
    );
    return await this.groupInvitationsService.acceptInvitation(
      invitationId,
      acceptingUserId,
    );
  }

  @Patch(':invitationId/reject')
  @ApiOperation({ summary: 'Rechaza una invitación a grupo.' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Invitación rechazada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La invitación no está pendiente o ha expirado.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para rechazar esta invitación.',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  async rejectInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const rejectingUserId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/${invitationId}/reject - Rechazando invitación por el usuario ${rejectingUserId}`,
    );
    return await this.groupInvitationsService.rejectInvitation(
      invitationId,
      rejectingUserId,
    );
  }

  @Patch(':invitationId/cancel')
  @ApiOperation({
    summary: 'Cancela una invitación a grupo (solo el remitente o un admin).',
  })
  @ApiBearerAuth()
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Requiere roles específicos para cancelar
  @UseGuards(RolesGuard)
  @ApiResponse({
    status: 200,
    description: 'Invitación cancelada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({ status: 400, description: 'La invitación no está pendiente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para cancelar esta invitación.',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  async cancelInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const cancellingUserId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/${invitationId}/cancel - Cancelando invitación por el usuario ${cancellingUserId}`,
    );
    return await this.groupInvitationsService.cancelInvitation(
      invitationId,
      cancellingUserId,
    );
  }

  @Delete(':invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Realiza un soft delete en una invitación a grupo (la marca como eliminada lógicamente).',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Invitación soft-deleted exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para soft-eliminar esta invitación.',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  async softDeleteInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/${invitationId} - Solicitud de soft-delete por el usuario ${userId}`,
    );
    await this.groupInvitationsService.softDeleteInvitation(
      invitationId,
      userId,
    );
  }

  @Delete(':invitationId/hard')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'ELIMINA PERMANENTEMENTE una invitación a grupo (solo SuperAdmin).',
  })
  @ApiBearerAuth()
  @Roles('SUPERADMIN') // Solo SUPERADMIN puede eliminar permanentemente
  @UseGuards(RolesGuard)
  @ApiResponse({
    status: 204,
    description: 'Invitación eliminada permanentemente.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para hard-eliminar esta invitación.',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  async hardDeleteInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req); // Solo para logging o trazabilidad, la autorización la maneja RolesGuard
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/${invitationId}/hard - Solicitud de hard-delete por el usuario ${userId}`,
    );
    await this.groupInvitationsService.hardDeleteInvitation(invitationId);
  }
}
