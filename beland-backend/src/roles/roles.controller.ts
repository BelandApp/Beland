import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Logger,
  UseGuards,
  Req, // Importar Request para acceder al usuario autenticado
  ForbiddenException, // Para errores de autorización (403)
  ParseUUIDPipe, // Para validar IDs como UUIDs automáticamente
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserDto } from '../users/dto/user.dto'; // Asegúrate de que esta ruta sea correcta
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

// Importar los guardias y decoradores de autorización
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator';
import { User } from 'src/users/entities/users.entity'; // Para el tipado del objeto de usuario en la request
import { Request } from 'express'; // Importar la interfaz Request de express para su correcto tipado

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth('JWT-auth') // Indica que todas las rutas requieren un token para la documentación de Swagger.
// Aplicar FlexibleAuthGuard, RolesGuard y PermissionsGuard a nivel de controlador.
// Esto significa que TODAS las rutas en este controlador requieren autenticación
// y los roles/permisos especificados, a menos que se use el bypass de SUPERADMIN.
@UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  // Helper para obtener el ID del usuario de la request.
  private getUserId(req: Request): string {
    const user = req.user as User;
    if (!user || !user.id) {
      this.logger.error(
        'getUserId(): ID de usuario no encontrado en la solicitud después de la autenticación.',
      );
      throw new ForbiddenException(
        'No se pudo determinar el ID del usuario autenticado para esta operación.',
      );
    }
    return user.id;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Solo Superadmin puede crear roles, con permiso 'user_permission'.
  // Las @UseGuards ya están en el controlador, no es necesario repetirlas aquí.
  @Roles('SUPERADMIN')
  @RequiredPermissions('user_permission') // Usando el permiso 'user_permission' de tu entidad Admin
  @ApiOperation({
    summary: 'Crear un nuevo rol (Solo Superadmin con permiso de usuario).',
  })
  @ApiResponse({
    status: 201,
    description: 'Rol creado exitosamente.',
    type: RoleDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: Request,
  ): Promise<RoleDto> {
    const userId = this.getUserId(req);
    this.logger.log(
      `POST /roles: Solicitud para crear rol "${createRoleDto.name}" por el usuario ID: ${userId}`,
    );
    try {
      const newRole = await this.rolesService.create(createRoleDto);
      this.logger.log(
        `Rol "${newRole.name}" (ID: ${newRole.role_id}) creado exitosamente por usuario ${userId}.`, // <-- ¡CORREGIDO AQUÍ!
      );
      return newRole;
    } catch (error) {
      this.logger.error(
        `Error al crear rol: ${(error as Error).message}`,
        (error as Error).stack,
      );
      // Re-lanza la excepción capturada por el servicio, que ya debería ser una HttpException de NestJS
      throw error;
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  // Solo Admin y Superadmin pueden obtener todos los roles, con permiso 'user_permission'.
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Usando el permiso 'user_permission'
  @ApiOperation({
    summary:
      'Obtener todos los roles (Solo Admin/Superadmin con permiso de usuario).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles.',
    type: [RoleDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findAll(@Req() req: Request): Promise<RoleDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `GET /roles: Solicitud para obtener todos los roles por el usuario ID: ${userId}.`,
    );
    try {
      return this.rolesService.findAll();
    } catch (error) {
      this.logger.error(
        `Error al obtener todos los roles: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // Solo Admin y Superadmin pueden obtener un rol por ID, con permiso 'user_permission'.
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Usando el permiso 'user_permission'
  @ApiOperation({
    summary:
      'Obtener un rol por ID (Solo Admin/Superadmin con permiso de usuario).',
  })
  @ApiParam({ name: 'id', description: 'ID único del rol', type: String })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado.',
    type: RoleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<RoleDto> {
    const userId = this.getUserId(req);
    this.logger.log(
      `GET /roles/${id}: Solicitud para obtener rol con ID: ${id} por el usuario ID: ${userId}.`,
    );
    try {
      const role = await this.rolesService.findOne(id);
      this.logger.log(
        `Rol con ID: ${id} encontrado exitosamente por usuario ${userId}.`,
      );
      return role;
    } catch (error) {
      this.logger.error(
        `Error al obtener rol ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':id/users')
  @HttpCode(HttpStatus.OK)
  // Solo Admin y Superadmin pueden obtener usuarios por ID de rol, con permiso 'user_permission'.
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('user_permission') // Usando el permiso 'user_permission'
  @ApiOperation({
    summary:
      'Obtener usuarios por ID de rol (Solo Admin/Superadmin con permiso de usuario).',
  })
  @ApiParam({ name: 'id', description: 'ID único del rol', type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios con el rol especificado.',
    type: [UserDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontraron usuarios para el rol o el rol no existe.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findUsersByRoleId(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<UserDto[]> {
    const userId = this.getUserId(req);
    this.logger.log(
      `GET /roles/${id}/users: Solicitud para obtener usuarios para rol con ID: ${id} por el usuario ID: ${userId}.`,
    );
    try {
      const users = await this.rolesService.findUsersByRoleId(id);
      this.logger.log(
        `Usuarios para rol ${id} obtenidos exitosamente por usuario ${userId}.`,
      );
      return users;
    } catch (error) {
      this.logger.error(
        `Error al obtener usuarios para rol ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  // Solo Superadmin puede actualizar roles, con permiso 'user_permission'.
  @Roles('SUPERADMIN')
  @RequiredPermissions('user_permission') // Usando el permiso 'user_permission'
  @ApiOperation({
    summary:
      'Actualizar un rol por ID (Solo Superadmin con permiso de usuario).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a actualizar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Rol actualizado exitosamente.',
    type: RoleDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  @ApiResponse({ status: 409, description: 'El nombre del rol ya existe.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: Request,
  ): Promise<RoleDto> {
    const userId = this.getUserId(req);
    this.logger.log(
      `PATCH /roles/${id}: Solicitud para actualizar rol con ID: ${id} por el usuario ID: ${userId}.`,
    );
    try {
      const updatedRole = await this.rolesService.update(id, updateRoleDto);
      this.logger.log(
        `Rol ${id} actualizado exitosamente por usuario ${userId}.`,
      );
      return updatedRole;
    } catch (error) {
      this.logger.error(
        `Error al actualizar rol ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // Solo Superadmin puede eliminar roles, con permiso 'user_permission'.
  @Roles('SUPERADMIN')
  @RequiredPermissions('user_permission') // Usando el permiso 'user_permission'
  @ApiOperation({
    summary: 'Eliminar un rol por ID (Solo Superadmin con permiso de usuario).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del rol a eliminar',
    type: String,
  })
  @ApiResponse({ status: 204, description: 'Rol eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req);
    this.logger.log(
      `DELETE /roles/${id}: Solicitud para eliminar rol con ID: ${id} por el usuario ID: ${userId}.`,
    );
    try {
      await this.rolesService.remove(id);
      this.logger.log(
        `Rol ${id} eliminado exitosamente por usuario ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error al eliminar rol ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
