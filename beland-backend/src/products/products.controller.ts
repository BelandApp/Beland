import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  Logger,
  UseGuards,
  Req, // Importar Request para acceder al usuario autenticado
  ForbiddenException, // Para errores de autorización (403)
  NotFoundException, // Para recursos no encontrados (404)
  BadRequestException, // Para datos inválidos (400)
  InternalServerErrorException, // Para errores inesperados (500)
  ParseUUIDPipe, // Para validar IDs como UUIDs automáticamente
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AddGroupTypesDto, CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

// Importar los guardias y decoradores de autorización
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequiredPermissions } from 'src/auth/decorators/permissions.decorator';
import { User } from 'src/users/entities/users.entity'; // Para el tipado del objeto de usuario en la request
import { Request } from 'express'; // Importar la interfaz Request de express para su correcto tipado

@ApiTags('products')
@Controller('products')
@ApiBearerAuth('JWT-auth') // Esto es para documentación de Swagger.
// IMPORTANTE: NO HAY @UseGuards a nivel de controlador para permitir rutas GET públicas.
// Cada ruta debe especificar sus propios guards ahora.
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

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

  // --- RUTAS DE ADMINISTRACIÓN/GESTIÓN DE PRODUCTOS (REQUIEREN AUTENTICACIÓN Y ROLES/PERMISOS) ---

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // Requerimos autenticación, rol ADMIN/SUPERADMIN y el permiso granular 'content_permission'.
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('content_permission') // <-- Usando 'content_permission'
  @ApiOperation({
    summary:
      'Crear un nuevo producto (solo Admin/Superadmin con permiso de contenido).',
  })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente.',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (rol o permiso insuficiente).',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async create(@Body() dto: CreateProductDto, @Req() req: Request) {
    const userId = this.getUserId(req);
    this.logger.log(
      `POST /products: Solicitud para crear producto por el usuario ID: ${userId}`,
    );
    try {
      const newProduct = await this.productsService.create(dto);
      this.logger.log(
        `Producto ID: ${newProduct.id} creado exitosamente por usuario ${userId}.`,
      );
      return newProduct;
    } catch (error) {
      this.logger.error(
        `Error al crear producto: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Post('group-types/:id')
  @HttpCode(HttpStatus.OK)
  // Requerimos autenticación, rol ADMIN/SUPERADMIN y el permiso granular 'content_permission'.
  // NOTA: Si esta acción es más sobre "moderar" o "aprobar" categorías, 'moderation_permission' podría ser más adecuado.
  // Por ahora, se asume 'content_permission'.
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('content_permission') // <-- Usando 'content_permission'
  @ApiOperation({
    summary:
      'Asociar tipos de grupo a un producto (solo Admin/Superadmin con permiso de contenido).',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'ID del producto' })
  @ApiBody({
    type: AddGroupTypesDto,
    examples: {
      example1: {
        summary: 'Ejemplo de asociación',
        value: { groupTypeIds: ['uuid-1', 'uuid-2'] },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado con nuevos tipos de grupo',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos o ID de grupo inválido.',
  })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({
    status: 404,
    description: 'Producto o tipo de grupo no encontrado.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async addGroupTypes(
    @Param('id', ParseUUIDPipe) productId: string,
    @Body() body: AddGroupTypesDto,
    @Req() req: Request,
  ): Promise<Product> {
    const userId = this.getUserId(req);
    this.logger.log(
      `POST /products/group-types/${productId}: Solicitud para asociar tipos de grupo por el usuario ID: ${userId}`,
    );
    try {
      const updatedProduct = await this.productsService.addGroupTypesToProduct(
        productId,
        body.groupTypeIds,
      );
      this.logger.log(
        `Tipos de grupo asociados al producto ${productId} exitosamente por usuario ${userId}.`,
      );
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error al asociar tipos de grupo al producto ${productId}: ${
          (error as Error).message
        }`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  // Requerimos autenticación, rol ADMIN/SUPERADMIN y el permiso granular 'content_permission'.
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('content_permission') // <-- Usando 'content_permission'
  @ApiOperation({
    summary:
      'Actualizar un producto por ID (solo Admin/Superadmin con permiso de contenido).',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente.',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const userId = this.getUserId(req);
    this.logger.log(
      `PATCH /products/${id}: Solicitud para actualizar producto por el usuario ID: ${userId}`,
    );
    try {
      const updatedProduct = await this.productsService.update(id, dto);
      this.logger.log(
        `Producto ${id} actualizado exitosamente por usuario ${userId}.`,
      );
      return updatedProduct;
    } catch (error) {
      this.logger.error(
        `Error al actualizar producto ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  // Requerimos autenticación, rol ADMIN/SUPERADMIN y el permiso granular 'content_permission'.
  @UseGuards(FlexibleAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('ADMIN', 'SUPERADMIN')
  @RequiredPermissions('content_permission') // <-- Usando 'content_permission'
  @ApiOperation({
    summary:
      'Eliminar un producto por ID (solo Admin/Superadmin con permiso de contenido).',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const userId = this.getUserId(req);
    this.logger.log(
      `DELETE /products/${id}: Solicitud para eliminar producto por el usuario ID: ${userId}`,
    );
    try {
      await this.productsService.remove(id);
      this.logger.log(
        `Producto ${id} eliminado exitosamente por usuario ${userId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error al eliminar producto ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  // --- RUTAS DE LECTURA DE PRODUCTOS (PÚBLICAS - NO REQUIEREN AUTENTICACIÓN) ---

  @Get()
  @HttpCode(HttpStatus.OK)
  // Esta ruta es pública: NO tiene @UseGuards explícito aquí.
  @ApiOperation({
    summary:
      'Listar productos con paginación, ordenamiento y filtrado (accesible públicamente).',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página, iniciando en 1.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de elementos por página (1-100).',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Columna para ordenar (ej. created_at, name).',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Orden de clasificación (ASC o DESC).',
  })
  @ApiQuery({
    name: 'category_id',
    required: false,
    type: String,
    description: 'Filtrar por ID de categoría.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filtrar por nombre de producto (coincidencia parcial).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos paginada.',
    type: [Product],
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros de consulta inválidos.',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findAll(@Query() query: ProductQueryDto) {
    this.logger.log(
      `GET /products: Solicitud para listar productos públicamente.`,
    );
    const { page, limit, sortBy, order, category_id, name } = query;
    try {
      return this.productsService.findAll(
        { page, limit },
        { sortBy, order },
        category_id,
        name,
      );
    } catch (error) {
      this.logger.error(
        `Error al listar productos: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  // Esta ruta es pública: NO tiene @UseGuards.
  @ApiOperation({
    summary: 'Obtener un producto por ID (accesible públicamente).',
  })
  @ApiParam({ name: 'id', description: 'UUID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto encontrado exitosamente.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    this.logger.log(
      `GET /products/${id}: Solicitud para buscar producto por ID públicamente.`,
    );
    try {
      const product = await this.productsService.findOne(id);
      if (!product) {
        this.logger.warn(`Producto con ID "${id}" no encontrado.`);
        throw new NotFoundException(`Producto con ID "${id}" no encontrado.`);
      }
      return product;
    } catch (error) {
      this.logger.error(
        `Error al buscar producto ${id}: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
