import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { AdminDto } from './dto/admin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator';

@ApiTags('admins')
@Controller('admins')
// @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminService) {}

  @Post()
  // @Roles('SUPERADMIN')
  // @RequiredPermissions('user_permission')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva entrada de administrador',
    description:
      'Asigna el rol de "admin" a un usuario existente y define sus permisos administrativos. Solo accesible por un **Superadmin** con permiso de gestión de usuarios.',
  })
  //@ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Administrador creado exitosamente.',
    type: AdminDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({
    status: 401,
    description: 'No autenticado (token inválido o ausente).',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Usuario a asignar no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'El usuario ya es un administrador.',
  })
  async create(@Body() createAdminDto: CreateAdminDto): Promise<AdminDto> {
    return this.adminsService.create(createAdminDto);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener la lista de todos los administradores',
    description:
      'Lista todos los usuarios que tienen una entrada en la tabla de administradores. Accesible por **Admin** y **Superadmin**.',
  })
  // @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Lista de administradores.',
    type: [AdminDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol insuficiente).',
  })
  async findAll(): Promise<AdminDto[]> {
    return this.adminsService.findAll();
  }

  @Get(':admin_id')
  @Roles('ADMIN', 'SUPERADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener un administrador por su ID',
    description:
      'Recupera los detalles de un administrador específico. Accesible por **Admin** y **Superadmin**.',
  })
  // @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'admin_id',
    description: 'ID único del administrador',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Administrador encontrado.',
    type: AdminDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Administrador no encontrado.' })
  async findOne(@Param('admin_id') admin_id: string): Promise<AdminDto> {
    return this.adminsService.findOne(admin_id);
  }

  @Patch(':admin_id')
  @Roles('SUPERADMIN')
  @RequiredPermissions('user_permission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar los permisos de un administrador',
    description:
      'Modifica los permisos de un administrador existente (contenido, usuarios, moderación, finanzas, analíticas, configuraciones, gestión de líderes y empresas). Solo accesible por un **Superadmin** con permiso de gestión de usuarios.',
  })
  // @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'admin_id',
    description: 'ID único del administrador a actualizar',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Administrador actualizado exitosamente.',
    type: AdminDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos (ej. intentar cambiar el user_id).',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Administrador no encontrado.' })
  async update(
    @Param('admin_id') admin_id: string,
    @Body() updateAdminDto: UpdateAdminDto,
  ): Promise<AdminDto> {
    return this.adminsService.update(admin_id, updateAdminDto);
  }

  @Delete(':admin_id')
  @Roles('SUPERADMIN')
  @RequiredPermissions('user_permission')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Eliminar una entrada de administrador y resetear el rol del usuario',
    description:
      'Elimina la entrada de un administrador de la tabla de "admins" y automáticamente revierte el rol del usuario asociado a "USER". Solo accesible por un **Superadmin** con permiso de gestión de usuarios.',
  })
  // @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'admin_id',
    description: 'ID único del administrador a eliminar',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Administrador eliminado exitosamente.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Administrador no encontrado.' })
  async remove(@Param('admin_id') admin_id: string): Promise<void> {
    await this.adminsService.remove(admin_id);
  }
}
