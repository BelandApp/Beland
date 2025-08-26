// src/testimonies/testimony.controller.ts
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
  ParseUUIDPipe,
  Logger,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTestimonyDto } from './dto/create-testimony.dto';
import { UpdateTestimonyDto } from './dto/update-testimony.dto';
import { TestimonyDto } from './dto/testimony.dto';
import { GetTestimoniesQueryDto } from './dto/get-testimonies-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { User } from 'src/users/entities/users.entity';
import { Request } from 'express';
import { TestimoniesService } from './testimonies.service';

@ApiTags('testimonies')
@Controller('testimonies')
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class TestimoniesController {
  private readonly logger = new Logger(TestimoniesController.name);

  constructor(private readonly testimoniesService: TestimoniesService) {}

  /**
   * Helper para extraer el ID del usuario autenticado de la solicitud.
   * Maneja tanto el 'id' (cuando el objeto User completo es adjuntado)
   * como el 'sub' (cuando el payload del JWT es adjuntado).
   * @param req El objeto de la solicitud Express.
   * @returns El ID del usuario.
   * @throws ForbiddenException si el ID del usuario no puede ser determinado.
   */
  private getUserId(req: Request): string {
    const user = req.user as any; // Usar 'any' para acceder flexiblemente a 'id' o 'sub'
    const userId = user?.id || user?.sub; // Primero intenta 'id', luego 'sub'

    if (!userId) {
      this.logger.error(
        'getUserId(): No se pudo determinar el ID del usuario autenticado (ni .id ni .sub encontrados en req.user).',
      );
      throw new ForbiddenException(
        'No se pudo determinar el ID del usuario autenticado para esta operación. Acceso denegado.',
      );
    }
    return userId;
  }

  /**
   * Helper para obtener el rol del usuario autenticado de la solicitud.
   * @param req El objeto de la solicitud Express.
   * @returns El nombre del rol del usuario.
   * @throws ForbiddenException si el rol del usuario no puede ser determinado.
   */
  private getUserRole(req: Request): string {
    const user = req.user as User;
    const userRole = user?.role_name;

    if (!userRole) {
      this.logger.error(
        'getUserRole(): No se pudo determinar el rol del usuario autenticado (role_name no encontrado en req.user).',
      );
      throw new ForbiddenException(
        'No se pudo determinar el rol del usuario autenticado para esta operación. Acceso denegado.',
      );
    }
    return userRole;
  }

  @Post()
  @UseGuards(FlexibleAuthGuard) // Solo usuarios autenticados pueden crear testimonios
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea un nuevo testimonio.' })
  @ApiBody({ type: CreateTestimonyDto })
  @ApiResponse({
    status: 201,
    description: 'Testimonio creado y pendiente de aprobación.',
    type: TestimonyDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Conflicto (ej. ya envió un testimonio).',
  })
  async create(
    @Body() createTestimonyDto: CreateTestimonyDto,
    @Req() req: Request,
  ): Promise<TestimonyDto> {
    const userId = this.getUserId(req);
    this.logger.log(
      `POST /testimonies: Solicitud para crear testimonio por usuario ID: ${userId}`,
    );
    try {
      return await this.testimoniesService.create(createTestimonyDto, userId);
    } catch (error) {
      this.logger.error(
        `Error al crear testimonio: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Fallo al crear el testimonio.');
    }
  }

  @Get()
  @UseGuards(FlexibleAuthGuard) // Puede ser accedido por usuarios autenticados para ver todos o públicos para ver solo aprobados
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Obtiene todos los testimonios. Los usuarios no autenticados solo ven aprobados.',
    description:
      'Los administradores pueden ver todos los testimonios (incluyendo pendientes y eliminados) aplicando los filtros `isApproved` y `includeDeleted`. Los usuarios normales solo ven testimonios aprobados.',
  })
  @ApiQuery({ type: GetTestimoniesQueryDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de testimonios obtenida exitosamente.',
    type: [TestimonyDto],
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado si se intenta usar filtros de admin sin rol.',
  })
  async findAll(
    @Query() query: GetTestimoniesQueryDto,
    @Req() req: Request,
  ): Promise<{ testimonies: TestimonyDto[]; total: number }> {
    const userId = this.getUserId(req);
    const userRole = this.getUserRole(req);
    this.logger.log(
      `GET /testimonies: Solicitud para obtener todos los testimonios por usuario ID: ${userId} (Rol: ${userRole})`,
    );
    try {
      return await this.testimoniesService.findAll(query, userId, userRole);
    } catch (error) {
      this.logger.error(
        `Error al obtener testimonios: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new InternalServerErrorException(
        'Fallo al obtener los testimonios.',
      );
    }
  }

  @Get(':id')
  @UseGuards(FlexibleAuthGuard) // Puede ser accedido por usuario autenticado (propietario) o admin, o público si está aprobado
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Obtiene un testimonio por su ID. Requiere permisos si no está aprobado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio (UUID).',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonio obtenido exitosamente.',
    type: TestimonyDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Testimonio no encontrado.' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<TestimonyDto> {
    const userId = this.getUserId(req);
    const userRole = this.getUserRole(req);
    this.logger.log(
      `GET /testimonies/${id}: Solicitud para obtener testimonio por ID: ${id} por usuario ID: ${userId} (Rol: ${userRole})`,
    );
    try {
      return await this.testimoniesService.findOne(id, userId, userRole);
    } catch (error) {
      this.logger.error(
        `Error al obtener testimonio ID: ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Fallo al obtener el testimonio.');
    }
  }

  @Patch(':id')
  @UseGuards(FlexibleAuthGuard) // Solo el autor o ADMIN/SUPERADMIN puede actualizar
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary:
      'Actualiza un testimonio por su ID (solo autor o ADMIN/SUPERADMIN).',
    description:
      'El autor solo puede modificar `content` y `rating`. Los administradores pueden modificar `is_approved` además de otros campos.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio a actualizar (UUID).',
    type: String,
  })
  @ApiBody({ type: UpdateTestimonyDto })
  @ApiResponse({
    status: 200,
    description: 'Testimonio actualizado exitosamente.',
    type: TestimonyDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Testimonio no encontrado.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTestimonyDto: UpdateTestimonyDto,
    @Req() req: Request,
  ): Promise<TestimonyDto> {
    const userId = this.getUserId(req);
    const userRole = this.getUserRole(req);
    this.logger.log(
      `PATCH /testimonies/${id}: Solicitud para actualizar testimonio ID: ${id} por usuario ID: ${userId} (Rol: ${userRole})`,
    );
    try {
      return await this.testimoniesService.update(
        id,
        updateTestimonyDto,
        userId,
        userRole,
      );
    } catch (error) {
      this.logger.error(
        `Error al actualizar testimonio ID: ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al actualizar el testimonio.',
      );
    }
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'SUPERADMIN') // Solo ADMIN/SUPERADMIN pueden aprobar testimonios
  @UseGuards(FlexibleAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Aprueba un testimonio (solo ADMIN/SUPERADMIN).' })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio a aprobar (UUID).',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Testimonio aprobado exitosamente.',
    type: TestimonyDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Testimonio ya aprobado o inválido.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Testimonio no encontrado.' })
  async approve(@Param('id', ParseUUIDPipe) id: string): Promise<TestimonyDto> {
    this.logger.log(
      `PATCH /testimonies/${id}/approve: Solicitud para aprobar testimonio ID: ${id}`,
    );
    try {
      return await this.testimoniesService.approveTestimony(id);
    } catch (error) {
      this.logger.error(
        `Error al aprobar testimonio ID: ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Fallo al aprobar el testimonio.');
    }
  }

  @Delete(':id')
  @UseGuards(FlexibleAuthGuard) // Solo el autor o ADMIN/SUPERADMIN puede soft-eliminar
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary:
      'Realiza un soft delete de un testimonio (solo autor o ADMIN/SUPERADMIN).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio a eliminar lógicamente (UUID).',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Testimonio eliminado lógicamente.',
  })
  @ApiResponse({ status: 400, description: 'Testimonio ya eliminado.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Testimonio no encontrado.' })
  async softDelete(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    const userId = this.getUserId(req);
    const userRole = this.getUserRole(req);
    this.logger.log(
      `DELETE /testimonies/${id}: Solicitud de soft-delete para testimonio ID: ${id} por usuario ID: ${userId} (Rol: ${userRole})`,
    );
    try {
      await this.testimoniesService.softDelete(id, userId, userRole);
    } catch (error) {
      this.logger.error(
        `Error al soft-eliminar testimonio ID: ${id}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al eliminar lógicamente el testimonio.',
      );
    }
  }

  @Delete(':id/hard')
  @Roles('SUPERADMIN') // Solo SUPERADMIN puede hard-eliminar
  @UseGuards(FlexibleAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'ELIMINA PERMANENTEMENTE un testimonio por ID (solo SUPERADMIN).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del testimonio a eliminar permanentemente (UUID).',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Testimonio eliminado permanentemente.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol insuficiente).',
  })
  @ApiResponse({ status: 404, description: 'Testimonio no encontrado.' })
  async hardDelete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    this.logger.warn(
      `DELETE /testimonies/${id}/hard: Solicitud de hard-delete para testimonio ID: ${id} (SOLO SUPERADMIN)`,
    );
    try {
      await this.testimoniesService.hardDelete(id);
    } catch (error) {
      this.logger.error(
        `Error al hard-eliminar testimonio ID: ${id}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Fallo al eliminar permanentemente el testimonio.',
      );
    }
  }
}
