// src/group-invitations/group-invitations.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
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
  ApiBody,
} from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { User } from 'src/users/entities/users.entity';
import { GroupsService } from 'src/groups/groups.service';
import { Request } from 'express'; // Importar Request de express para el tipo req.user

@ApiTags('group-invitations')
@Controller('group-invitations')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
export class GroupInvitationsController {
  private readonly logger = new Logger(GroupInvitationsController.name);

  constructor(
    private readonly groupInvitationsService: GroupInvitationsService,
    private readonly groupsService: GroupsService,
  ) {}

  /**
   * Método auxiliar para obtener el ID de usuario y el rol de la solicitud.
   * @param req El objeto de solicitud de Express (ahora con la propiedad 'user' debido a la extensión de la interfaz).
   * @returns Un objeto que contiene el ID de usuario y el nombre del rol.
   * @throws ForbiddenException si no se puede determinar el ID de usuario o el rol.
   */
  private getUserInfo(req: Request): { userId: string; roleName: string } {
    const user = req.user; // 'user' property es reconocida gracias a src/common/interfaces/request-with-user.interface.ts
    if (!user || !user.id || !user.role_name) {
      this.logger.error(
        'getUserInfo(): No se encontró ID de usuario o rol en el JWT.',
      );
      throw new ForbiddenException(
        'Contexto de autenticación de usuario faltante. Asegúrese de proporcionar un JWT válido.',
      );
    }
    return { userId: user.id, roleName: user.role_name };
  }

  @Post()
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Enviar una invitación a grupo',
    description:
      'Envía una invitación a un usuario para unirse a un grupo específico. El usuario invitado puede ser identificado por email, nombre de usuario o número de teléfono. Solo los líderes de grupo o administradores pueden enviar invitaciones.',
  })
  @ApiBody({
    type: CreateGroupInvitationDto,
    description:
      'Proporcione group_id y al menos uno de: email, username, o phone.',
    examples: {
      emailInvite: {
        summary: 'Invitación por Email',
        value: {
          group_id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'invited.user@example.com',
          role: 'MEMBER',
        },
      },
      usernameInvite: {
        summary: 'Invitación por Nombre de Usuario',
        value: {
          group_id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'invitedUser',
          role: 'MEMBER',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Invitación a grupo enviada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Entrada inválida (por ejemplo, no se proporcionó identificador, teléfono no numérico, invitándose a sí mismo).',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido (no autorizado para enviar invitaciones para este grupo).',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo o usuario invitado no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya es miembro o tiene una invitación pendiente.',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createInvitationDto: CreateGroupInvitationDto,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const { userId, roleName } = this.getUserInfo(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations - Enviando invitación del usuario ${userId} al grupo ${createInvitationDto.group_id}`,
    );

    const group = await this.groupsService.findGroupById(
      createInvitationDto.group_id,
    );
    if (!group) {
      throw new NotFoundException(
        `Grupo con ID "${createInvitationDto.group_id}" no encontrado.`,
      );
    }

    const isCurrentUserLeader = group.leader?.id === userId;
    const isCurrentUserAdminOrSuperAdmin =
      roleName === 'ADMIN' || roleName === 'SUPERADMIN';

    if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
      throw new ForbiddenException(
        'Solo el líder del grupo o un administrador pueden enviar invitaciones para este grupo.',
      );
    }

    try {
      return await this.groupInvitationsService.createInvitation(
        createInvitationDto,
        userId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `create(): Error al enviar invitación: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `create(): Error interno del servidor al enviar invitación: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al enviar la invitación a grupo debido a un error interno.',
      );
    }
  }

  @Get('my-pending')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary:
      'Obtener todas las invitaciones pendientes para el usuario autenticado',
    description:
      'Recupera una lista de todas las invitaciones a grupo pendientes enviadas al usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de invitaciones pendientes.',
    type: [GroupInvitationDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getMyPendingInvitations(
    @Req() req: Request,
  ): Promise<GroupInvitationDto[]> {
    const { userId } = this.getUserInfo(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/my-pending - Obteniendo invitaciones pendientes para el usuario ${userId}`,
    );
    try {
      return await this.groupInvitationsService.findUserPendingInvitations(
        userId,
      );
    } catch (error) {
      this.logger.error(
        `getMyPendingInvitations(): Error interno del servidor: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al recuperar las invitaciones pendientes debido a un error interno.',
      );
    }
  }

  @Patch(':invitationId/accept')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary: 'Aceptar una invitación a grupo',
    description:
      'Acepta una invitación a grupo pendiente. El usuario será añadido al grupo como miembro.',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'ID de la invitación a aceptar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitación aceptada exitosamente. Usuario añadido al grupo.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invitación no pendiente, expirada o solicitud inválida.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (no es el usuario invitado).',
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
    const { userId: acceptingUserId } = this.getUserInfo(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/:invitationId/accept - El usuario ${acceptingUserId} aceptando la invitación ${invitationId}`,
    );
    try {
      return await this.groupInvitationsService.acceptInvitation(
        invitationId,
        acceptingUserId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        this.logger.warn(
          `acceptInvitation(): Error al aceptar invitación: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `acceptInvitation(): Error interno del servidor al aceptar invitación: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al aceptar la invitación debido a un error interno.',
      );
    }
  }

  @Patch(':invitationId/reject')
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA')
  @ApiOperation({
    summary: 'Rechazar una invitación a grupo',
    description: 'Rechaza una invitación a grupo pendiente.',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'ID de la invitación a rechazar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitación rechazada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invitación no pendiente, expirada o ya rechazada.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (no es el usuario invitado).',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  async rejectInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const { userId: rejectingUserId } = this.getUserInfo(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/:invitationId/reject - El usuario ${rejectingUserId} rechazando la invitación ${invitationId}`,
    );
    try {
      return await this.groupInvitationsService.rejectInvitation(
        invitationId,
        rejectingUserId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `rejectInvitation(): Error al rechazar invitación: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `rejectInvitation(): Error interno del servidor al rechazar invitación: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al rechazar la invitación debido a un error interno.',
      );
    }
  }

  @Patch(':invitationId/cancel')
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Cancelar una invitación a grupo pendiente',
    description:
      'Permite al usuario que envió la invitación (o a un administrador) cancelar una invitación pendiente.',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'ID de la invitación a cancelar.',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitación cancelada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'La invitación no está pendiente o no se puede cancelar.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (no es el remitente o un administrador).',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  async cancelInvitation(
    @Param('invitationId') invitationId: string,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const { userId: cancellingUserId, roleName } = this.getUserInfo(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/:invitationId/cancel - El usuario ${cancellingUserId} cancelando la invitación ${invitationId}`,
    );
    try {
      const invitation =
        await this.groupInvitationsService.findInvitationById(invitationId);
      const isCurrentUserSender = invitation.sender.id === cancellingUserId;
      const isCurrentUserAdminOrSuperAdmin =
        roleName === 'ADMIN' || roleName === 'SUPERADMIN';

      if (!isCurrentUserSender && !isCurrentUserAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'No estás autorizado para cancelar esta invitación. Solo el remitente o un administrador pueden cancelar invitaciones.',
        );
      }

      return await this.groupInvitationsService.cancelInvitation(
        invitationId,
        cancellingUserId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `cancelInvitation(): Error al cancelar invitación: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `cancelInvitation(): Error interno del servidor al cancelar invitación: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al cancelar la invitación debido a un error interno.',
      );
    }
  }

  @Delete(':invitationId')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary:
      'Eliminar una invitación a grupo permanentemente (Solo Admin/Superadmin)',
    description:
      'Elimina una invitación a grupo permanentemente de la base de datos. Esta acción es irreversible y debe usarse con precaución. Solo accesible por administradores.',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'ID de la invitación a eliminar.',
  })
  @ApiResponse({
    status: 204,
    description: 'Invitación eliminada exitosamente (Sin Contenido).',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (rol/permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Invitación no encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvitation(
    @Param('invitationId') invitationId: string,
  ): Promise<void> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /group-invitations/:invitationId - Eliminando invitación ${invitationId}`,
    );
    try {
      await this.groupInvitationsService.deleteInvitation(invitationId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `deleteInvitation(): Error al eliminar invitación: ${(error as Error).message}`,
        );
        throw error;
      }
      this.logger.error(
        `deleteInvitation(): Error interno del servidor al eliminar invitación: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al eliminar la invitación debido a un error interno.',
      );
    }
  }
}
