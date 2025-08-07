import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpStatus,
  HttpCode,
  Logger,
  UseGuards, // Importar Logger
  // UseGuards, // Comentado temporalmente
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserDto } from '../users/dto/user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Comentado temporalmente
// import { RolesGuard } from '../auth/guards/roles.guard'; // Comentado temporalmente
// import { Roles } from '../auth/decorators/roles.decorator'; // Comentado temporalmente
// import { PermissionsGuard } from 'src/auth/guards/permissions.guard'; // Comentado temporalmente
// import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator'; // Comentado temporalmente

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
// @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard) // Comentado temporalmente
export class RolesController {
  private readonly logger = new Logger(RolesController.name); // Añadir logger

  constructor(private readonly rolesService: RolesService) {}

  @Post()
  // @Roles('SUPERADMIN') // Revertido a SUPERADMIN
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo rol (Solo Superadmin con permiso de usuario)',
  })
  // @ApiBearerAuth('JWT-auth')
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
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /roles - Creando rol: ${createRoleDto.name}`,
    );
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  // @Roles('ADMIN', 'SUPERADMIN') // Revertido a ADMIN, SUPERADMIN
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener todos los roles (Solo Admin/Superadmin)' })
  // @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Lista de roles.',
    type: [RoleDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol insuficiente).',
  })
  async findAll(): Promise<RoleDto[]> {
    this.logger.log('🚧 [BACKEND] Ruta /roles - Obteniendo todos los roles.');
    return this.rolesService.findAll();
  }

  @Get(':id')
  // @Roles('ADMIN', 'SUPERADMIN') // Revertido a ADMIN, SUPERADMIN
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un rol por ID (Solo Admin/Superadmin)' })
  // @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID único del rol', type: String })
  @ApiResponse({
    status: 200,
    description: 'Rol encontrado.',
    type: RoleDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Rol no encontrado.' })
  async findOne(@Param('id') id: string): Promise<RoleDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /roles/:id - Obteniendo rol con ID: ${id}`,
    );
    const role = await this.rolesService.findOne(id);
    // El servicio ya lanza NotFoundException, no es necesario verificar aquí de nuevo
    return role;
  }

  @Get(':id/users')
  // @Roles('ADMIN', 'SUPERADMIN') // Revertido a ADMIN, SUPERADMIN
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Obtener usuarios por ID de rol (Solo Admin/Superadmin con permiso de usuario)',
  })
  // @ApiBearerAuth('JWT-auth')
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
  async findUsersByRoleId(@Param('id') id: string): Promise<UserDto[]> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /roles/:id/users - Obteniendo usuarios para rol con ID: ${id}`,
    );
    const users = await this.rolesService.findUsersByRoleId(id);
    // El servicio ya lanza NotFoundException si no hay usuarios o rol no existe
    return users;
  }

  @Patch(':id')
  // @Roles('SUPERADMIN') // Revertido a SUPERADMIN
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Actualizar un rol por ID (Solo Superadmin con permiso de usuario)',
  })
  // @ApiBearerAuth('JWT-auth')
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
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleDto> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /roles/:id - Actualizando rol con ID: ${id}`,
    );
    const updatedRole = await this.rolesService.update(id, updateRoleDto);
    // El servicio ya lanza NotFoundException si no encuentra el rol
    return updatedRole;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // @Roles('SUPERADMIN') // Revertido a SUPERADMIN
  // @RequiredPermissions('user_permission') // Comentado temporalmente
  @ApiOperation({
    summary: 'Eliminar un rol por ID (Solo Superadmin con permiso de usuario)',
  })
  // @ApiBearerAuth('JWT-auth')
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
  async remove(@Param('id') id: string): Promise<void> {
    this.logger.log(
      `🚧 [BACKEND] Ruta /roles/:id - Eliminando rol con ID: ${id}`,
    );
    await this.rolesService.remove(id);
  }
}
