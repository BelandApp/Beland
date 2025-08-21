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
  ParseUUIDPipe, // Para validar IDs como UUIDs automáticamente
  Logger,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UsePipes, // Importar UsePipes para ValidationPipe a nivel de método
  ValidationPipe, // Importar ValidationPipe
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupDto } from './dto/group.dto';
// Importar los DTOs públicos
import { PublicGroupDto } from './dto/public-group.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody, // Para documentar el cuerpo de la solicitud en Swagger
} from '@nestjs/swagger';
// Rutas absolutas para guards y decoradores
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator';
import { Request } from 'express'; // Importar la interfaz Request de express para su correcto tipado
import { User } from 'src/users/entities/users.entity';
import { GetGroupsQueryDto } from './dto/get-groups-query.dto';
import { InviteUserDto } from 'src/group-members/dto/create-group-member.dto'; // Usar InviteUserDto para el cuerpo de la solicitud
import { GroupMemberDto } from 'src/group-members/dto/group-member.dto';
import { UpdateGroupMemberDto } from 'src/group-members/dto/update-group-member.dto';
import { UsersService } from 'src/users/users.service';
import { CreateGroupMemberDto } from 'src/group-members/dto/create-group-member.dto'; // Importar CreateGroupMemberDto
import { plainToInstance } from 'class-transformer'; // Importar plainToInstance aquí
import { GroupInvitationDto } from 'src/group-invitations/dto/group-invitation.dto'; // IMPORTACIÓN AÑADIDA/VERIFICADA

@ApiTags('groups') // Etiqueta para la documentación de Swagger
@Controller('groups')
// Importante: NO HAY @UseGuards a nivel de controlador. Se aplicarán de forma granular.
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name); // Inicializar logger

  constructor(
    private readonly groupsService: GroupsService,
    private readonly usersService: UsersService, // Se mantiene UsersService para resolver usuarios en el controlador
  ) {}

  /**
   * Método auxiliar para obtener el ID de usuario de la solicitud.
   * Prioriza el ID de usuario del JWT. Ya no usa query parameter opcional.
   * @param req El objeto de solicitud de Express.
   * @returns El ID de usuario.
   * @throws ForbiddenException si no se puede determinar el ID de usuario.
   */
  private getUserId(req: Request): string {
    // Si req.user (del JWT) tiene un ID, úsalo.
    const userId = (req.user as User)?.id;
    if (!userId) {
      this.logger.error(
        'getUserId(): No se encontró ID de usuario en JWT. Se requiere autenticación.',
      );
      throw new ForbiddenException(
        'ID de usuario no encontrado. Se requiere autenticación.',
      );
    }
    return userId;
  }

  /**
   * Helper para manejar errores de forma consistente.
   * Relanza excepciones de NestJS si las detecta; de lo contrario, lanza InternalServerError.
   * @param error El error capturado.
   * @param context El contexto en el que ocurrió el error (nombre del método).
   * @throws HttpException Una excepción de NestJS (NotFound, BadRequest, Conflict, Forbidden, InternalServerError).
   */
  private handleError(error: unknown, context: string): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido.';
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`Error en ${context}: ${errorMessage}`, errorStack);

    // Relanza la excepción si ya es una HttpException (incluye NotFound, BadRequest, Conflict, Forbidden, InternalServer)
    if (
      error instanceof ForbiddenException ||
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof InternalServerErrorException
    ) {
      throw error;
    }
    // Para cualquier otro tipo de error no esperado, lanza un error 500
    throw new InternalServerErrorException(
      `Ha ocurrido un error inesperado al procesar la solicitud en ${context}.`,
    );
  }

  // --- RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN) ---
  // Ej: Para mostrar grupos en la landing page.

  @Get()
  // SIN GUARDS: Esta ruta es pública y no requiere autenticación.
  @ApiOperation({
    summary: 'Obtener todos los grupos (acceso público)',
    description:
      'Recupera una lista paginada de todos los grupos **activos**, con opciones de filtrado y ordenación. Esta ruta es de acceso público y no requiere autenticación. Solo expone información pública (nombre, imagen, miembros con nombre y foto de perfil).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de grupos con información pública.',
    type: [PublicGroupDto], // ¡IMPORTANTE: Usar PublicGroupDto aquí!
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página, comenzando desde 1. (Predeterminado: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Número de elementos por página (1-100). (Predeterminado: 10)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description:
      'Columna para ordenar (ej. created_at, name, status). (Predeterminado: created_at)',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Orden de clasificación (ASC o DESC). (Predeterminado: DESC)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filtrar por nombre de grupo (coincidencia parcial).',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'PENDING', 'INACTIVE', 'DELETE'],
    description: 'Filtrar por estado del grupo.',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Aplicar validación y transformación
  async findAll(
    @Query() queryDto: GetGroupsQueryDto, // Usar el DTO para capturar los parámetros de consulta
  ): Promise<{ groups: PublicGroupDto[]; total: number }> {
    // ¡IMPORTANTE: Usar PublicGroupDto en el retorno!
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups - Obteniendo todos los grupos (acceso público).`,
    );
    try {
      // Forzar la inclusión de grupos no eliminados y solo activos para la vista pública.
      queryDto.includeDeleted = false;
      queryDto.status = 'ACTIVE';

      // Obtener los grupos completos del servicio (que retornará GroupDto por defecto)
      const { groups, total } = await this.groupsService.findAllGroups(
        queryDto,
      );

      // ¡Transformar los resultados a PublicGroupDto para la exposición pública!
      const publicGroups = groups.map((group) =>
        plainToInstance(PublicGroupDto, group, {
          enableCircularCheck: true, // Manejar referencias circulares si las hay
          excludeExtraneousValues: true, // Excluir propiedades no decoradas con @Expose
        }),
      );

      return { groups: publicGroups, total };
    } catch (error) {
      this.handleError(error, 'obtener todos los grupos (público)');
    }
  }

  // --- NUEVA RUTA: GRUPOS A LOS QUE PERTENECE EL USUARIO AUTENTICADO ---

  @Get('my-groups')
  @UseGuards(FlexibleAuthGuard) // Solo requiere autenticación
  @ApiOperation({
    summary:
      'Obtener todos los grupos a los que pertenece el usuario autenticado',
    description:
      'Recupera una lista de todos los grupos de los que el usuario autenticado es miembro o líder. Requiere autenticación.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description:
      'Lista de grupos a los que pertenece el usuario, con información completa.',
    type: [GroupDto], // Retorna GroupDto para información completa
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (ID de usuario no encontrado).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getMyGroups(@Req() req: Request): Promise<GroupDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/my-groups - Obteniendo grupos para el usuario ${userId}.`,
    );
    try {
      const groups = await this.groupsService.getUserGroups(userId); // Nuevo método en GroupsService
      return groups;
    } catch (error) {
      this.handleError(error, 'obtener mis grupos');
    }
  }

  // --- RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN, Y ALGUNAS ROL/PERMISO ESPECÍFICO) ---

  @Post()
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Aplicar guards de autenticación, rol y permisos
  @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN', 'EMPRESA') // Todos los usuarios autenticados pueden crear un grupo
  @ApiOperation({
    summary: 'Crear un nuevo grupo',
    description:
      'Crea un nuevo grupo y asigna al usuario autenticado como su líder y primer miembro.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Grupo creado exitosamente.',
    type: GroupDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (ID de usuario no encontrado o rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Líder de usuario no encontrado.' })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createGroupDto: CreateGroupDto,
    @Req() req: Request,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req); // Obtener el ID del usuario autenticado
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups - Creando grupo por el usuario ID: ${userId}`,
    );
    try {
      const newGroup = await this.groupsService.createGroup(
        createGroupDto,
        userId,
      );
      return newGroup;
    } catch (error) {
      this.handleError(error, 'crear grupo');
    }
  }

  @Get(':groupId')
  @UseGuards(FlexibleAuthGuard) // Solo requiere autenticación para esta ruta específica.
  // La lógica de autorización más granular se maneja dentro del método.
  @ApiOperation({
    summary: 'Obtener grupo por ID (acceso autorizado)',
    description:
      'Recupera los detalles de un grupo específico. Los líderes de grupo y los Administradores/Superadministradores pueden ver cualquier grupo. Los miembros regulares pueden ver los grupos de los que forman parte. Requiere autenticación.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'ID del grupo a recuperar.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo encontrado exitosamente.',
    type: GroupDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (no autorizado para ver este grupo).',
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado.' })
  async findOne(
    @Param('groupId', ParseUUIDPipe) groupId: string, // Asegura que el ID es un UUID
    @Req() req: Request,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req); // Obtener el ID del usuario autenticado
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId - Obteniendo grupo con ID: ${groupId} para el usuario ${userId}`,
    );
    try {
      const group = await this.groupsService.findGroupById(groupId);

      const isCurrentUserLeader = group.leader?.id === userId;
      const isCurrentUserMember = group.members?.some(
        (member) => member.user?.id === userId, // Usar encadenamiento opcional para seguridad
      );
      const currentUserRole = (req.user as User)?.role_name;
      const isCurrentUserAdminOrSuperAdmin =
        currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

      // Lógica de autorización: El usuario debe ser el líder, un miembro o un administrador/superadministrador
      if (
        !isCurrentUserLeader &&
        !isCurrentUserMember &&
        !isCurrentUserAdminOrSuperAdmin
      ) {
        throw new ForbiddenException(
          'No tienes autorización para ver este grupo. Debes ser el líder, un miembro o un administrador.',
        );
      }
      return group; // El servicio ya retorna GroupDto
    } catch (error) {
      this.handleError(error, 'obtener grupo por ID');
    }
  }

  @Patch(':groupId')
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Aplicar guards
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Solo el líder del grupo o Admin/Superadmin puede actualizar un grupo
  @RequiredPermissions('content_permission') // Admins/Superadmins podrían necesitar 'content_permission'
  @ApiOperation({
    summary: 'Actualizar un grupo por ID',
    description:
      'Actualiza los detalles de un grupo específico. Solo el líder del grupo o un administrador/superadministrador puede realizar esta acción.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'El ID del grupo a actualizar.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Grupo actualizado exitosamente.',
    type: GroupDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido (el usuario actual no es el líder del grupo y no es un Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado.' })
  async update(
    @Param('groupId', ParseUUIDPipe) groupId: string, // Asegura que el ID es un UUID
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: Request,
  ): Promise<GroupDto> {
    const userId = this.getUserId(req); // Obtener el ID del usuario autenticado // CORREGIDO: Usar 'userId' consistentemente
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId - Actualizando grupo con ID: ${groupId} por el usuario ${userId}`,
    );
    try {
      const group = await this.groupsService.findGroupById(groupId);

      const isCurrentUserLeader = group.leader?.id === userId; // CORREGIDO: Usar 'userId'
      const currentUserRole = (req.user as User)?.role_name;
      const isCurrentUserAdminOrSuperAdmin =
        currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

      if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Solo el líder del grupo o un administrador pueden actualizar los detalles del grupo.',
        );
      }

      const updatedGroup = await this.groupsService.updateGroup(
        groupId,
        updateGroupDto,
      );
      return updatedGroup;
    } catch (error) {
      this.handleError(error, 'actualizar grupo');
    }
  }

  @Delete(':groupId')
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Aplicar guards
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN') // Solo el líder del grupo, admin o superadmin puede eliminar un grupo
  @RequiredPermissions('content_permission') // Admins/Superadmins podrían necesitar 'content_permission'
  @ApiOperation({
    summary: 'Eliminar un grupo por ID',
    description:
      'Elimina un grupo. Solo el líder del grupo o un administrador/superadministrador puede realizar esta acción.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'El ID del grupo a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Grupo eliminado exitosamente (Sin contenido).',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido (el usuario actual no es el líder del grupo y no es un Admin/Superadmin).',
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT) // 204 No Content para eliminación exitosa
  async remove(
    @Param('groupId', ParseUUIDPipe) groupId: string, // Asegura que el ID es un UUID
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req); // Obtener el ID del usuario autenticado
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId - Eliminando grupo con ID: ${groupId} por el usuario ${userId}`,
    );
    try {
      const group = await this.groupsService.findGroupById(groupId); // Obtener el grupo para verificar el líder

      const isCurrentUserLeader = group.leader?.id === userId;
      const currentUserRole = (req.user as User)?.role_name;
      const isCurrentUserAdminOrSuperAdmin =
        currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

      if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Solo el líder del grupo o un administrador pueden eliminar este grupo.',
        );
      }

      await this.groupsService.hardDeleteGroup(groupId); // CORREGIDO: Llamada a hardDeleteGroup
    } catch (error) {
      this.handleError(error, 'eliminar grupo');
    }
  }

  // --- RUTAS PROTEGIDAS: Gestión de Miembros de Grupo ---

  @Post(':groupId/members')
  @ApiOperation({
    summary: 'Invita a un usuario a un grupo',
    description:
      'Permite al líder del grupo o a un administrador invitar a un usuario a un grupo. El usuario se puede especificar por email, username o teléfono. El usuario invitado se añadirá como MIEMBRO.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'ID del grupo al que invitar',
    type: String,
  })
  @ApiBody({ type: InviteUserDto })
  @ApiResponse({
    status: 201,
    description: 'Invitación enviada exitosamente.',
    type: GroupInvitationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o usuario ya es miembro.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado para enviar invitaciones a este grupo.',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo o usuario invitado no encontrado.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Ya existe una invitación pendiente para este usuario o el usuario ya es miembro.',
  })
  async inviteUser(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Body(ValidationPipe) inviteUserDto: InviteUserDto,
    @Req() req: Request,
  ): Promise<GroupInvitationDto> {
    const currentUserId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members - Enviando invitación al grupo ${groupId} por el usuario ${currentUserId}`,
    );

    try {
      const group = await this.groupsService.findGroupById(groupId);

      const isCurrentUserLeader = group.leader?.id === currentUserId;
      const currentUserRole = (req.user as User)?.role_name;
      const isCurrentUserAdminOrSuperAdmin =
        currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

      if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Solo el líder del grupo o un administrador pueden invitar miembros a este grupo.',
        );
      }

      return await this.groupsService.inviteUserToGroup(
        groupId,
        inviteUserDto,
        currentUserId,
      );
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `inviteUser(): Error al enviar invitación: ${
            (error as Error).message
          }`,
        );
        throw error;
      }
      this.logger.error(
        `inviteUser(): Internal server error al enviar invitación: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al enviar la invitación debido a un error interno.',
      );
    }
  }

  @Get(':groupId/members')
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN', 'USER', 'EMPRESA')
  @ApiOperation({
    summary: 'Obtener todos los miembros de un grupo específico',
    description:
      'Recupera una lista de todos los miembros para un grupo dado. Accesible por el líder del grupo, cualquier miembro del grupo o un Administrador/Superadministrador.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'groupId',
    description: 'ID del grupo del que recuperar los miembros.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de miembros del grupo.',
    type: [GroupMemberDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description:
      'Prohibido (no autorizado para ver los miembros de este grupo).',
  })
  @ApiResponse({ status: 404, description: 'Grupo no encontrado.' })
  async getMembers(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Req() req: Request,
  ): Promise<GroupMemberDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members - Obteniendo miembros para el grupo ${groupId} por el usuario ${userId}`,
    );
    try {
      const group = await this.groupsService.findGroupById(groupId);

      const isCurrentUserLeader = group.leader?.id === userId;
      const isCurrentUserMember = group.members?.some(
        (member) => member.user?.id === userId,
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
          'No tienes autorización para ver los miembros de este grupo. Debes ser el líder, un miembro o un administrador.',
        );
      }

      const members = await this.groupsService.getGroupMembers(groupId);
      return members;
    } catch (error) {
      this.handleError(error, 'obtener miembros del grupo');
    }
  }

  @Patch(':groupId/members/:memberId')
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission')
  @ApiOperation({
    summary: 'Actualizar un miembro de un grupo (ej. cambiar rol)',
    description:
      'Actualiza un miembro específico de un grupo. Solo el líder del grupo o un Admin/Superadmin puede realizar esta acción.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'groupId', description: 'ID del grupo.', type: String })
  @ApiParam({
    name: 'memberId',
    description: 'ID de la entrada del miembro del grupo.',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Miembro del grupo actualizado exitosamente.',
    type: GroupMemberDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (no autorizado para actualizar este miembro).',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo o miembro del grupo no encontrado.',
  })
  async updateMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() updateGroupMemberDto: UpdateGroupMemberDto,
    @Req() req: Request,
  ): Promise<GroupMemberDto> {
    const currentUserId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members/:memberId - Actualizando miembro ${memberId} en el grupo ${groupId} por el usuario ${currentUserId}`,
    );
    try {
      const group = await this.groupsService.findGroupById(groupId);

      const isCurrentUserLeader = group.leader?.id === currentUserId;
      const currentUserRole = (req.user as User)?.role_name;
      const isCurrentUserAdminOrSuperAdmin =
        currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

      if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Solo el líder del grupo o un administrador pueden actualizar miembros del grupo.',
        );
      }

      const updatedMember = await this.groupsService.updateGroupMemberRole(
        memberId,
        updateGroupMemberDto,
      );
      return updatedMember;
    } catch (error) {
      this.handleError(error, 'actualizar miembro del grupo');
    }
  }

  @Delete(':groupId/members/:memberId')
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('LEADER', 'ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission')
  @ApiOperation({
    summary: 'Eliminar un miembro de un grupo',
    description:
      'Elimina un miembro específico de un grupo. Solo el líder del grupo o un Admin/Superadmin puede realizar esta acción. No se puede eliminar directamente al último líder de un grupo activo.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'groupId', description: 'ID del grupo.', type: String })
  @ApiParam({
    name: 'memberId',
    description: 'ID de la entrada del miembro del grupo a eliminar.',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Miembro del grupo eliminado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede eliminar al último líder de un grupo activo.',
  })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido (no autorizado para eliminar a este miembro).',
  })
  @ApiResponse({
    status: 404,
    description: 'Grupo o miembro del grupo no encontrado.',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('groupId', ParseUUIDPipe) groupId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Req() req: Request,
  ): Promise<void> {
    const currentUserId = this.getUserId(req);
    this.logger.log(
      `🚧 [BACKEND] Ruta /groups/:groupId/members/:memberId - Eliminando miembro ${memberId} del grupo ${groupId} por el usuario ${currentUserId}`,
    );
    try {
      const group = await this.groupsService.findGroupById(groupId);

      const isCurrentUserLeader = group.leader?.id === currentUserId;
      const currentUserRole = (req.user as User)?.role_name;
      const isCurrentUserAdminOrSuperAdmin =
        currentUserRole === 'ADMIN' || currentUserRole === 'SUPERADMIN';

      if (!isCurrentUserLeader && !isCurrentUserAdminOrSuperAdmin) {
        throw new ForbiddenException(
          'Solo el líder del grupo o un administrador pueden eliminar miembros de este grupo.',
        );
      }

      await this.groupsService.removeGroupMember(memberId);
    } catch (error) {
      this.handleError(error, 'eliminar miembro del grupo');
    }
  }
}
