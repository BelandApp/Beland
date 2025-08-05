import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  DefaultValuePipe,
  ParseIntPipe,
  ParseBoolPipe,
  HttpCode,
  HttpStatus,
  // UseGuards, // Comentado temporalmente
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/users.entity'; // Importar la entidad User
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/swagger';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Comentado temporalmente
// import { RolesGuard } from '../auth/guards/roles.guard'; // Comentado temporalmente
// import { Roles } from '../auth/decorators/roles.decorator'; // Comentado temporalmente
// import { PermissionsGuard } from 'src/auth/guards/permissions.guard'; // Comentado temporalmente
// import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator'; // Comentado temporalmente

// DTO para la ruta de bloqueo/desbloqueo
class BlockUserDto extends PickType(UpdateUserDto, ['isBlocked'] as const) {
  @IsBoolean({ message: 'isBlocked debe ser un valor booleano.' })
  @IsNotEmpty({ message: 'isBlocked no puede estar vacío.' })
  isBlocked: boolean;
}

@ApiTags('users')
@Controller('users')
// @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  private handleError(error: unknown, context: string): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`${context}: ${errorMessage}`, errorStack);
    throw new InternalServerErrorException(`Error interno en ${context}`);
  }

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo usuario',
    description: 'Crea un nuevo usuario en el sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get('by-email')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @ApiOperation({
    summary: 'Buscar usuario por dirección de email',
    description:
      'Permite a un **Admin/Superadmin** con `user_permission` buscar un usuario específico por su dirección de email.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({
    name: 'email',
    description: 'Email del usuario a buscar',
    type: String,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async findUserByEmail(@Query('email') email: string): Promise<UserDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/by-email - Buscando por email: ${email}`,
    );
    try {
      const user = await this.usersService.findByEmail(email);
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `findUserByEmail(): Usuario con email "${email}" no encontrado.`,
        );
        throw error;
      }
      this.handleError(error, 'findUserByEmail');
    }
  }

  @Get('me')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Comentado temporalmente
  // @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener información del usuario autenticado',
    description:
      'Retorna el perfil completo del usuario que está autenticado en la sesión.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Información del usuario autenticado.',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado (raro si está autenticado).',
  })
  async getAuthenticatedUser(@Request() req): Promise<UserDto> {
    this.logger.log(
      '🚧 [BACKEND] Ruta /users/me - Obteniendo info del usuario autenticado.',
    );
    try {
      const user = req.user as User;
      if (!user || !user.id) {
        throw new NotFoundException(
          'Usuario autenticado no encontrado en la solicitud.',
        );
      }
      return this.usersService.findOne(user.id);
    } catch (error) {
      this.handleError(error, 'getAuthenticatedUser');
    }
  }

  @Patch('me')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Comentado temporalmente
  // @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Actualizar información del usuario autenticado',
    description:
      'Permite al usuario autenticado actualizar su propio nombre y foto de perfil.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Perfil de usuario actualizado exitosamente.',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado (intento de modificar campos restringidos o perfil ajeno).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async updateAuthenticatedUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    this.logger.log(
      '🚧 [BACKEND] Ruta /users/me - Actualizando info del usuario autenticado.',
    );
    try {
      const user = req.user as User;
      if (!user || !user.id) {
        throw new NotFoundException(
          'Usuario autenticado no encontrado en la solicitud.',
        );
      }
      const updatedUser = await this.usersService.updateMe(
        user.id,
        updateUserDto,
      );
      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(
          `updateAuthenticatedUser(): Error al actualizar perfil: ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'updateAuthenticatedUser');
    }
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener lista de usuarios con paginación, filtrado y ordenación',
    description:
      'Lista todos los usuarios en el sistema. Solo accesible por **Admin/Superadmin**. Soporta paginación, ordenación y filtrado por ID, email, rol y estado de bloqueo. Los **Admins/Superadmins** pueden ver usuarios desactivados.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios con paginación.',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserDto' },
        },
        total: { type: 'number', example: 100 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findAll(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('sortBy', new DefaultValuePipe('created_at')) sortBy: string,
    @Query('order', new DefaultValuePipe('DESC')) order: 'ASC' | 'DESC',
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    includeDeleted: boolean,
    @Query('id') id?: string,
    @Query('email') email?: string,
    @Query('roleName') roleName?: string,
    @Query('isBlocked', ParseBoolPipe) isBlocked?: boolean,
  ): Promise<{ users: UserDto[]; total: number; page: number; limit: number }> {
    this.logger.log('🚧 [BACKEND] Ruta /users - Buscando usuarios.');
    try {
      const currentUser = req.user as User;
      const isSuperAdminOrAdmin =
        currentUser?.role_name === 'ADMIN' ||
        currentUser?.role_name === 'SUPERADMIN';

      const bIncludeDeleted = isSuperAdminOrAdmin && includeDeleted;
      const filterId = isSuperAdminOrAdmin ? id : undefined;
      const filterEmail = isSuperAdminOrAdmin ? email : undefined;
      const filterRoleName = isSuperAdminOrAdmin ? roleName : undefined;
      const filterIsBlocked =
        isSuperAdminOrAdmin && isBlocked !== undefined ? isBlocked : undefined;

      if (!isSuperAdminOrAdmin) {
        if (includeDeleted) {
          throw new ForbiddenException(
            'No tienes permiso para ver usuarios desactivados.',
          );
        }
        if (id || email || roleName || isBlocked !== undefined) {
          throw new ForbiddenException(
            'No tienes permiso para usar filtros avanzados de usuarios.',
          );
        }
      }

      const { users, total } = await this.usersService.findAll(
        { page, limit },
        { sortBy, order },
        bIncludeDeleted,
        filterId,
        filterEmail,
        filterRoleName,
        filterIsBlocked,
      );

      return {
        users: users,
        total,
        page,
        limit,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(
          `findAll(): Error en permisos o parámetros: ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'findAll');
    }
  }

  @Get('deactivated')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener usuarios desactivados (solo Admin/Superadmin)',
    description:
      'Lista todos los usuarios que han sido marcados como desactivados (soft-deleted).',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios desactivados.',
    type: [UserDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findDeactivatedUsers(): Promise<UserDto[]> {
    this.logger.log(
      '🚧 [BACKEND] Ruta /users/deactivated - Buscando usuarios desactivados.',
    );
    try {
      const users = await this.usersService.findDeactivatedUsers();
      return users;
    } catch (error) {
      this.handleError(error, 'findDeactivatedUsers');
    }
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description:
      'Recupera los detalles de un usuario específico. Solo el **propietario** o un **Admin/Superadmin** puede acceder. Un Admin/Superadmin también puede incluir perfiles desactivados.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID del usuario', type: String })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado.',
    type: UserDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description:
      'No autorizado (no es el propietario o rol/permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findOne(
    @Param('id') id: string,
    @Request() req,
    @Query('includeDeleted', new DefaultValuePipe(false), ParseBoolPipe)
    includeDeleted: boolean,
  ): Promise<UserDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/:id - Buscando usuario con ID: ${id}`,
    );
    try {
      const currentUser = req.user as User;
      const isSuperAdminOrAdmin =
        currentUser?.role_name === 'ADMIN' ||
        currentUser?.role_name === 'SUPERADMIN';

      const bIncludeDeleted = isSuperAdminOrAdmin && includeDeleted;

      // Si el usuario actual no es el propietario y no tiene permisos de admin
      if (currentUser?.id !== id && !isSuperAdminOrAdmin) {
        throw new ForbiddenException(
          'No tienes autorización para ver este perfil de usuario.',
        );
      }

      // Si se solicita incluir eliminados y no tiene permisos de admin
      if (bIncludeDeleted && !isSuperAdminOrAdmin) {
        throw new ForbiddenException(
          'No tienes autorización para ver perfiles de usuario desactivados.',
        );
      }

      const user = await this.usersService.findOne(id, bIncludeDeleted);
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `findOne(): Error al buscar usuario con ID "${id}": ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'findOne');
    }
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un usuario por ID (Solo para Admins/Superadmins)',
    description:
      'Permite a un **Admin/Superadmin** actualizar cualquier perfil de usuario, incluyendo nombre, foto, rol, estado de bloqueo y estado de activación/desactivación.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a actualizar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente.',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente para esta acción).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 409, description: 'Conflicto (ej. email ya en uso).' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ): Promise<UserDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/:id - Actualizando usuario con ID: ${id}`,
    );
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        this.logger.warn(
          `update(): Error al actualizar usuario con ID "${id}": ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'update');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @ApiOperation({
    summary: 'Desactivar (soft-delete) un usuario por ID',
    description:
      'Marca un usuario como desactivado en la base de datos (soft-delete). Solo accesible por **Admin/Superadmin**. No elimina el registro físicamente.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a desactivar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario desactivado exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado o ya desactivado.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async softDeleteUser(@Param('id') id: string): Promise<void> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/:id - Desactivando usuario con ID: ${id}`,
    );
    try {
      await this.usersService.softDeleteUser(id);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(
          `softDeleteUser(): Error al desactivar usuario con ID "${id}": ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'softDeleteUser');
    }
  }

  @Patch(':id/reactivate')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reactivar un usuario por ID',
    description:
      'Marca un usuario previamente desactivado como activo. Solo accesible por **Admin/Superadmin**.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a reactivar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario reactivado exitosamente.',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Usuario ya activo.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async reactivateUser(@Param('id') id: string): Promise<UserDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/:id/reactivate - Reactivando usuario con ID: ${id}`,
    );
    try {
      const user = await this.usersService.reactivateUser(id);
      return user;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(
          `reactivateUser(): Error al reactivar usuario con ID "${id}": ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'reactivateUser'); // Usar handleError
    }
  }

  @Patch(':id/block-status')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bloquear o desbloquear un usuario por ID',
    description:
      'Permite a un **Admin/Superadmin** cambiar el estado de bloqueo (`isBlocked`) de un usuario.',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a bloquear/desbloquear',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de bloqueo del usuario actualizado exitosamente.',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async updateBlockStatus(
    @Param('id') id: string,
    @Body() blockUserDto: BlockUserDto,
  ): Promise<UserDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/:id/block-status - Actualizando estado de bloqueo para ID: ${id} a ${blockUserDto.isBlocked}`,
    );
    try {
      const updatedUser = await this.usersService.updateBlockStatus(
        id,
        blockUserDto.isBlocked,
      );
      return updatedUser;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(
          `updateBlockStatus(): Error al actualizar estado de bloqueo para ID "${id}": ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'updateBlockStatus'); // Usar handleError
    }
  }
}
