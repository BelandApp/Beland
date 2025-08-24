import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ParseUUIDPipe, // Para validar IDs como UUIDs automáticamente
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req, // Importar Req para acceder al usuario autenticado
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/users.entity';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { GetUserByIdQueryDto } from './dto/get-user-by-id-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer'; // Import plainToInstance

// Importar los guardias y decoradores de autorización
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator';
import { Request } from 'express'; // Importar la interfaz Request de express para su correcto tipado

// DTO para la ruta de bloqueo/desbloqueo (puede vivir aquí o en un archivo separado)
class BlockUserDto extends PickType(UpdateUserDto, ['isBlocked'] as const) {
  @IsBoolean({ message: 'isBlocked debe ser un valor booleano.' })
  @IsNotEmpty({ message: 'isBlocked no puede estar vacío.' })
  isBlocked: boolean;
}

@ApiTags('users')
@Controller('users')
// Importante: No hay @UseGuards a nivel de controlador. Cada ruta especifica su propio guardia para flexibilidad.
@ApiBearerAuth('JWT-auth') // Esto es para la documentación de Swagger, indica que la mayoría de rutas aquí usan auth.
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  // Helper para manejar errores de forma consistente
  // Relanza excepciones de NestJS si las detecta, de lo contrario, lanza InternalServerError.
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

  constructor(private readonly usersService: UsersService) {}

  // Helper para obtener el ID del usuario de la request.
  // Lanza ForbiddenException si el usuario no está correctamente autenticado o no tiene ID.
  private getUserId(req: Request): string {
    const user = req.user as User;
    if (!user || !user.id) {
      this.logger.error(
        'getUserId(): ID de usuario no encontrado en la solicitud después de la autenticación.',
      );
      throw new ForbiddenException(
        'No se pudo determinar el ID del usuario autenticado para esta operación. Acceso denegado.',
      );
    }
    return user.id;
  }

  // --- RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN) ---
  // Ideal para el registro de nuevos usuarios.

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario (público).',
    description:
      'Permite a un nuevo usuario registrarse en el sistema. No requiere autenticación.',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente.',
    type: UserDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.log(
      `POST /users: Solicitud de registro para el email: ${createUserDto.email}`,
    );
    try {
      const newUser = await this.usersService.create(createUserDto);
      this.logger.log(
        `Usuario con ID ${newUser.id} y email ${newUser.email} registrado exitosamente.`,
      );
      return newUser;
    } catch (error) {
      this.handleError(error, 'crear usuario');
    }
  }

  // --- RUTAS PROTEGIDAS PARA USUARIOS AUTENTICADOS (ACCESO A RECURSOS PROPIOS) ---
  // Requieren solo autenticación (FlexibleAuthGuard). No necesitan Roles ni Permissions.

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard) // Solo requiere autenticación
  @ApiOperation({
    summary: 'Obtener información del usuario autenticado.',
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
    description:
      'Usuario no encontrado (raro si está autenticado y token válido).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async getAuthenticatedUser(@Req() req: Request): Promise<UserDto> {
    const userId = this.getUserId(req); // Asegura que el usuario y su ID existan
    this.logger.log(
      `GET /users/me: Solicitud de perfil del usuario autenticado ID: ${userId}.`,
    );
    try {
      const user = await this.usersService.findOneById(userId);
      this.logger.log(`Perfil del usuario ${userId} obtenido exitosamente.`);
      return user;
    } catch (error) {
      this.handleError(error, 'obtener perfil de usuario autenticado');
    }
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard) // Solo requiere autenticación
  @ApiOperation({
    summary: 'Actualizar información del usuario autenticado.',
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
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async updateAuthenticatedUser(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    const userId = this.getUserId(req);
    this.logger.log(
      `PATCH /users/me: Solicitud para actualizar perfil del usuario autenticado ID: ${userId}.`,
    );
    try {
      // El servicio debe encargarse de la lógica de qué campos se pueden actualizar por el propio usuario.
      const updatedUser = await this.usersService.update(userId, updateUserDto);
      this.logger.log(`Perfil del usuario ${userId} actualizado exitosamente.`);
      return updatedUser;
    } catch (error) {
      this.handleError(error, 'actualizar perfil de usuario autenticado');
    }
  }

  // --- RUTAS PROTEGIDAS PARA ADMINISTRADORES (REQUIEREN ROL Y PERMISO ESPECÍFICO) ---
  // Estas rutas requieren autenticación con FlexibleAuthGuard, y luego validación de Roles y Permissions.

  @Get('by-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Buscar usuario por dirección de email (Solo Admin/Superadmin con permiso de usuario).',
    description:
      'Permite a un **Admin/Superadmin** con `user_permission` buscar un usuario específico por su dirección de email.',
  })
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
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findUserByEmail(
    @Query('email') email: string,
    @Req() req: Request,
  ): Promise<UserDto> {
    const adminUserId = this.getUserId(req); // El ID del administrador que realiza la búsqueda
    this.logger.log(
      `GET /users/by-email: Solicitud de búsqueda por email "${email}" por Admin ID: ${adminUserId}.`,
    );
    try {
      // Usar findUserEntityByEmail y transformar a DTO
      const userEntity = await this.usersService.findUserEntityByEmail(email);
      const userDto = plainToInstance(UserDto, userEntity); // Transformar entidad a DTO
      this.logger.log(
        `Usuario con email "${email}" encontrado exitosamente por Admin ID: ${adminUserId}.`,
      );
      return userDto;
    } catch (error) {
      this.handleError(error, 'buscar usuario por email');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Obtener lista de usuarios con paginación, filtrado y ordenación (Solo Admin/Superadmin con permiso de usuario).',
    description:
      'Lista todos los usuarios en el sistema. Soporta paginación, ordenación y filtrado por ID, email, rol y estado de bloqueo. Solo los usuarios **Admin/Superadmin** pueden ver usuarios desactivados.',
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
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(
    @Req() req: Request,
    @Query() query: GetUsersQueryDto,
  ): Promise<{ users: UserDto[]; total: number; page: number; limit: number }> {
    const adminUserId = this.getUserId(req);
    this.logger.log(
      `GET /users: Solicitud para listar usuarios por Admin ID: ${adminUserId}.`,
    );
    try {
      const currentUser = req.user as User;
      const isSuperAdminOrAdmin =
        currentUser?.role_name === 'ADMIN' ||
        currentUser?.role_name === 'SUPERADMIN';

      // Pasa el `query` y el `isSuperAdminOrAdmin` al servicio para que decida `includeDeleted`.
      const { users, total } = await this.usersService.findAll(
        query,
        isSuperAdminOrAdmin,
      );

      this.logger.log(
        `Lista de usuarios obtenida exitosamente por Admin ID: ${adminUserId}. Total: ${total}`,
      );
      return {
        users: users,
        total,
        page: query.page,
        limit: query.limit,
      };
    } catch (error) {
      this.handleError(error, 'listar usuarios');
    }
  }

  @Get('deactivated')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Obtener usuarios desactivados (Solo Admin/Superadmin con permiso de usuario).',
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
  async findDeactivatedUsers(@Req() req: Request): Promise<UserDto[]> {
    const adminUserId = this.getUserId(req);
    this.logger.log(
      `GET /users/deactivated: Solicitud para obtener usuarios desactivados por Admin ID: ${adminUserId}.`,
    );
    try {
      const users = await this.usersService.findDeactivatedUsers();
      this.logger.log(
        `Usuarios desactivados obtenidos exitosamente por Admin ID: ${adminUserId}. Total: ${users.length}`,
      );
      return users;
    } catch (error) {
      this.handleError(error, 'obtener usuarios desactivados');
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard) // Solo requiere autenticación. La lógica de autorización es interna.
  @ApiOperation({
    summary: 'Obtener un usuario por ID (Propietario o Admin/Superadmin).',
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findOne(
    @Param('id', ParseUUIDPipe) id: string, // Asegura que el ID es un UUID
    @Req() req: Request,
    @Query() query: GetUserByIdQueryDto, // DTO para `includeDeleted`
  ): Promise<UserDto> {
    const currentUserId = this.getUserId(req); // ID del usuario autenticado
    this.logger.log(
      `GET /users/${id}: Solicitud para buscar usuario con ID: ${id} por el usuario ID: ${currentUserId}.`,
    );
    try {
      const currentUser = req.user as User;
      const isSuperAdminOrAdmin =
        currentUser?.role_name === 'ADMIN' ||
        currentUser?.role_name === 'SUPERADMIN';

      // Lógica de autorización: Permitir acceso si es el propio usuario o si es Admin/Superadmin.
      if (currentUserId !== id && !isSuperAdminOrAdmin) {
        throw new ForbiddenException(
          'No tienes autorización para ver este perfil de usuario.',
        );
      }

      // La lógica de `bIncludeDeleted` se maneja en el servicio,
      // aquí solo preparamos el valor que se le pasará.
      const bIncludeDeleted = isSuperAdminOrAdmin
        ? query.includeDeleted
        : false;

      const user = await this.usersService.findOneById(id, bIncludeDeleted);
      this.logger.log(`Usuario con ID ${id} encontrado exitosamente.`);
      return user;
    } catch (error) {
      this.handleError(error, 'obtener usuario por ID');
    }
  }

  @Patch('changeRoleToCommerce')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard)
  @Roles('USER')
  @ApiOperation({
    summary:
      'Actualiza del estado USER a el estado COMMERCE.',
  })
  async changeRoleToCommerce( @Req() req: Request ): Promise<UserDto> {
     return await this.usersService.update(req.user.id, {role: 'COMMERCE'})
  }


  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Actualizar un usuario por ID (Solo para Admins/Superadmins con permiso de usuario).',
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
    @Param('id', ParseUUIDPipe) id: string, // Asegura que el ID es un UUID
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const adminUserId = this.getUserId(req); // El usuario que hace la actualización (Admin/Superadmin)
    this.logger.log(
      `PATCH /users/${id}: Solicitud para actualizar usuario con ID: ${id} por Admin ID: ${adminUserId}.`,
    );
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      this.logger.log(
        `Usuario con ID ${id} actualizado exitosamente por Admin ID: ${adminUserId}.`,
      );
      return updatedUser;
    } catch (error) {
      this.handleError(error, 'actualizar usuario por ID');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Desactivar (soft-delete) un usuario por ID (Solo Admin/Superadmin con permiso de usuario).',
    description:
      'Marca un usuario como desactivado en la base de datos (soft-delete). No elimina el registro físicamente.',
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
  async softDeleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    // Asegura que el ID es un UUID
    const adminUserId = this.getUserId(req);
    this.logger.log(
      `DELETE /users/${id}: Solicitud para desactivar usuario con ID: ${id} por Admin ID: ${adminUserId}.`,
    );
    try {
      await this.usersService.softDeleteUser(id);
      this.logger.log(
        `Usuario con ID ${id} desactivado exitosamente por Admin ID: ${adminUserId}.`,
      );
      // No retorna nada para 204 No Content
    } catch (error) {
      this.handleError(error, 'desactivar usuario');
    }
  }

  @Patch(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Reactivar un usuario por ID (Solo Admin/Superadmin con permiso de usuario).',
    description: 'Marca un usuario previamente desactivado como activo.',
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
  async reactivateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<UserDto> {
    // Asegura que el ID es un UUID
    const adminUserId = this.getUserId(req);
    this.logger.log(
      `PATCH /users/${id}/reactivate: Solicitud para reactivar usuario con ID: ${id} por Admin ID: ${adminUserId}.`,
    );
    try {
      const user = await this.usersService.reactivateUser(id);
      this.logger.log(
        `Usuario con ID ${id} reactivado exitosamente por Admin ID: ${adminUserId}.`,
      );
      return user;
    } catch (error) {
      this.handleError(error, 'reactivar usuario');
    }
  }

  @Patch(':id/block-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard) // Requiere autenticación, rol y permiso
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Permiso para gestionar usuarios
  @ApiOperation({
    summary:
      'Bloquear o desbloquear un usuario por ID (Solo Admin/Superadmin con permiso de usuario).',
    description:
      'Permite a un **Admin/Superadmin** cambiar el estado de bloqueo (`isBlocked`) de un usuario.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a bloquear/desbloquear',
    type: String,
  })
  @ApiBody({ type: BlockUserDto }) // Añadido para Swagger
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
    @Param('id', ParseUUIDPipe) id: string, // Asegura que el ID es un UUID
    @Body() blockUserDto: BlockUserDto,
    @Req() req: Request,
  ): Promise<UserDto> {
    const adminUserId = this.getUserId(req);
    this.logger.log(
      `PATCH /users/${id}/block-status: Solicitud para actualizar estado de bloqueo para ID: ${id} a ${blockUserDto.isBlocked} por Admin ID: ${adminUserId}.`,
    );
    try {
      const updatedUser = await this.usersService.updateBlockStatus(
        id,
        blockUserDto.isBlocked,
      );
      this.logger.log(
        `Estado de bloqueo para usuario con ID ${id} actualizado a ${blockUserDto.isBlocked} exitosamente por Admin ID: ${adminUserId}.`,
      );
      return updatedUser;
    } catch (error) {
      this.handleError(error, 'actualizar estado de bloqueo de usuario');
    }
  }
}
