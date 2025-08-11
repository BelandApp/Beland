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
  UsePipes, // Importar UsePipes
  ValidationPipe,
  UseGuards, // Importar ValidationPipe
  // UseGuards, // Comentado temporalmente
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/users.entity'; // Importar la entidad User
import { GetUsersQueryDto } from './dto/get-users-query.dto'; // Importar el DTO para findAll
import { GetUserByIdQueryDto } from './dto/get-user-by-id-query.dto'; // Importar el nuevo DTO
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
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';

// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Comentado temporalmente
// import { RolesGuard } from '../auth/guards/roles.guard'; // Comentado temporalmente
// import { Roles } from '../auth/decorators/roles.decorator'; // Comentado temporalmente
// import { PermissionsGuard } = 'src/auth/guards/permissions.guard'; // Comentado temporalmente
// import { RequiredPermissions } = 'src/auth/decorators/permissions.decorator'; // Comentado temporalmente

// DTO para la ruta de bloqueo/desbloqueo
class BlockUserDto extends PickType(UpdateUserDto, ['isBlocked'] as const) {
  @IsBoolean({ message: 'isBlocked debe ser un valor booleano.' })
  @IsNotEmpty({ message: 'isBlocked no puede estar vacío.' })
  isBlocked: boolean;
}

// Definición de tipo para todos los roles válidos (debe coincidir con UsersService y RolesService)
type ValidRoleNames = 'USER' | 'LEADER' | 'ADMIN' | 'SUPERADMIN' | 'EMPRESA';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
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
    required: true, // Este sí es requerido para esta ruta específica
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Comentado temporalmente
  // @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Obtener información del usuario autenticado',
    description:
      'Retorna el perfil completo del usuario que está autenticado en la sesión.',
  })
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtAuthGuard, RolesGuard) // Comentado temporalmente
  // @Roles('USER', 'LEADER', 'ADMIN', 'SUPERADMIN')
  @ApiOperation({
    summary: 'Actualizar información del usuario autenticado',
    description:
      'Permite al usuario autenticado actualizar su propio nombre y foto de perfil.',
  })
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener lista de usuarios con paginación, filtrado y ordenación',
    description:
      'Lista todos los usuarios en el sistema. Soporta paginación, ordenación y filtrado por ID, email, rol y estado de bloqueo. Los usuarios **Admin/Superadmin** pueden ver usuarios desactivados, de lo contrario, solo se verán usuarios activos.',
  })
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
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Aplicar ValidationPipe para transformar y validar el DTO
  async findAll(
    @Request() req,
    @Query() query: GetUsersQueryDto, // Usar el nuevo DTO
  ): Promise<{ users: UserDto[]; total: number; page: number; limit: number }> {
    this.logger.log('🚧 [BACKEND] Ruta /users - Buscando usuarios.');
    try {
      const currentUser = req.user as User; // currentUser será undefined si no hay autenticación
      const isSuperAdminOrAdmin =
        currentUser?.role_name === 'ADMIN' ||
        currentUser?.role_name === 'SUPERADMIN';

      // Los valores por defecto y la validación ya están en el DTO (query)
      const {
        page,
        limit,
        sortBy,
        order,
        includeDeleted,
        id,
        email,
        roleName,
        isBlocked,
      } = query;

      // Lógica para determinar si se deben incluir usuarios eliminados
      // Si el usuario es Admin/Superadmin, se respeta el valor de includeDeleted del query.
      // Si no es Admin/Superadmin, includeDeleted siempre será false (no se pueden ver desactivados).
      const bIncludeDeleted = isSuperAdminOrAdmin ? includeDeleted : false;

      // Lógica para los filtros avanzados:
      // Si el usuario es Admin/Superadmin, se usan los filtros del query.
      // Si no es Admin/Superadmin, los filtros avanzados se ignoran (se establecen a undefined).
      const filterId = isSuperAdminOrAdmin ? id : undefined;
      const filterEmail = isSuperAdminOrAdmin ? email : undefined;
      const filterRoleName = isSuperAdminOrAdmin ? roleName : undefined;
      const filterIsBlocked = isSuperAdminOrAdmin ? isBlocked : undefined;

      // NOTA: Si los guards están comentados, `req.user` será `undefined`.
      // Esto significa que `isSuperAdminOrAdmin` será `false`.
      // Por lo tanto, `bIncludeDeleted` siempre será `false` y los `filter*` serán `undefined`.
      // La ruta funcionará, pero los usuarios no-admin (o no autenticados)
      // solo verán usuarios activos y sin filtros avanzados.
      // Si se desea que los usuarios no-admin puedan usar algunos filtros,
      // esa lógica debería ser ajustada aquí (ej. permitir filtrar por email, pero no por isBlocked).
      // Por ahora, se mantiene la restricción de que solo admins pueden usar filtros avanzados
      // y ver desactivados, incluso sin guards.

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
      // Aquí solo capturamos errores que puedan surgir del servicio o de la lógica de negocio.
      // La ForbiddenException por permisos ya no se lanza directamente aquí.
      if (error instanceof BadRequestException) {
        this.logger.warn(
          `findAll(): Error en parámetros de la solicitud: ${error.message}`,
        );
        throw error;
      }
      this.handleError(error, 'findAll');
    }
  }

  @Get('deactivated')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener usuarios desactivados (solo Admin/Superadmin)',
    description:
      'Lista todos los usuarios que han sido marcados como desactivados (soft-deleted).',
  })
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
      `🚧 [BACKEND] Ruta /users/deactivated - Buscando usuarios desactivados.`,
    );
    try {
      const users = await this.usersService.findDeactivatedUsers();
      return users;
    } catch (error) {
      this.handleError(error, 'findDeactivatedUsers');
    }
  }

  @Get(':id')
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener un usuario por ID',
    description:
      'Recupera los detalles de un usuario específico. Solo el **propietario** o un **Admin/Superadmin** puede acceder. Un Admin/Superadmin también puede incluir perfiles desactivados.',
  })
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true })) // Aplicar ValidationPipe para transformar y validar el DTO
  async findOne(
    @Param('id') id: string,
    @Request() req,
    @Query() query: GetUserByIdQueryDto, // Usar el nuevo DTO aquí
  ): Promise<UserDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /users/:id - Buscando usuario con ID: ${id}`,
    );
    try {
      const currentUser = req.user as User;
      const isSuperAdminOrAdmin =
        currentUser?.role_name === 'ADMIN' ||
        currentUser?.role_name === 'SUPERADMIN';

      const bIncludeDeleted = isSuperAdminOrAdmin
        ? query.includeDeleted
        : false; // Acceder desde el DTO, y restringir si no es admin

      // Si el usuario actual no es el propietario y no tiene permisos de admin
      if (currentUser?.id !== id && !isSuperAdminOrAdmin) {
        throw new ForbiddenException(
          'No tienes autorización para ver este perfil de usuario.',
        );
      }

      // Si se solicita incluir eliminados y no tiene permisos de admin
      if (bIncludeDeleted && !isSuperAdminOrAdmin) {
        // Esta condición ahora es redundante si bIncludeDeleted ya es false para no-admins
        // pero se mantiene para claridad si la lógica de bIncludeDeleted cambia.
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar un usuario por ID (Solo para Admins/Superadmins)',
    description:
      'Permite a un **Admin/Superadmin** actualizar cualquier perfil de usuario, incluyendo nombre, foto, rol, estado de bloqueo y estado de activación/desactivación.',
  })
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @ApiOperation({
    summary: 'Desactivar (soft-delete) un usuario por ID',
    description:
      'Marca un usuario como desactivado en la base de datos (soft-delete). Solo accesible por **Admin/Superadmin**. No elimina el registro físicamente.',
  })
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reactivar un usuario por ID',
    description:
      'Marca un usuario previamente desactivado como activo. Solo accesible por **Admin/Superadmin**.',
  })
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
  @UseGuards(AuthenticationGuard)
  @ApiBearerAuth('JWT-auth')
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
  // @Roles('ADMIN', 'SUPERADMIN')
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bloquear o desbloquear un usuario por ID',
    description:
      'Permite a un **Admin/Superadmin** cambiar el estado de bloqueo (`isBlocked`) de un usuario.',
  })
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
