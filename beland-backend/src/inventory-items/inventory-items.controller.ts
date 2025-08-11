import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InventoryItemsService } from './inventory-items.service';
import { InventoryItem } from './entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('inventory-items')
@Controller('inventory-items')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class InventoryItemsController {
  constructor(private readonly service: InventoryItemsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Listar items de inventario con paginación y filtrado por producto',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  @ApiQuery({
    name: 'product_id',
    required: false,
    type: String,
    description:
      'Filtrar items de inventario por ID de producto, si no se envia retorna todos los items de inventario',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de items de inventario retornado correctamente',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('product_id') product_id = '',
  ): Promise<[InventoryItem[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(product_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un item de inventario por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del item de inventario' })
  @ApiResponse({ status: 200, description: 'item de inventario encontrado' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el item de inventario',
  })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryItem> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo item de inventario' })
  @ApiResponse({
    status: 201,
    description: 'item de inventario creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos para crear el item de inventario',
  })
  @ApiResponse({
    status: 500,
    description: 'No se pudo crear el item de inventario',
  })
  async create(@Body() body: CreateInventoryItemDto): Promise<InventoryItem> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un item de inventario existente' })
  @ApiParam({ name: 'id', description: 'UUID del item de inventario' })
  @ApiResponse({
    status: 200,
    description: 'item de inventario actualizado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el item de inventario a actualizar',
  })
  @ApiResponse({
    status: 500,
    description: 'Error al actualizar el item de inventario',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateInventoryItemDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un item de inventario por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del item de inventario' })
  @ApiResponse({
    status: 204,
    description: 'item de inventario eliminado correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el item de inventario a eliminar',
  })
  @ApiResponse({
    status: 409,
    description: 'No se puede eliminar el item de inventario (conflicto)',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
