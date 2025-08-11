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
import { OrderItemsService } from './order-items.service';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderItemDto } from './dto/create-order-item.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
<<<<<<< HEAD
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
=======
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
>>>>>>> dev

@ApiTags('order-items')
@Controller('order-items')
@ApiBearerAuth('JWT-auth')
<<<<<<< HEAD
@UseGuards(AuthenticationGuard)
=======
@UseGuards(FlexibleAuthGuard)
>>>>>>> dev
export class OrderItemsController {
  constructor(private readonly service: OrderItemsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar items de Ordenes con paginación y filtrado por orden' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'order_id', required: false, type: String, description: 'Filtrar items de ordenes por ID de orden, si no se envia retorna todos los items' })
  @ApiResponse({ status: 200, description: 'Listado de items de Orden retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('order_id') order_id = '',
  ): Promise<[OrderItem[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(order_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un item de Orden por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del item de Orden' })
  @ApiResponse({ status: 200, description: 'item de Orden encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el item de Orden' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<OrderItem> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo item de Orden' })
  @ApiResponse({ status: 201, description: 'item de Orden creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el item de Orden' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el item de Orden' })
  async create(@Body() body: CreateOrderItemDto): Promise<OrderItem> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un item de Orden existente' })
  @ApiParam({ name: 'id', description: 'UUID del item de Orden' })
  @ApiResponse({ status: 200, description: 'item de Orden actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el item de Orden a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el item de Orden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOrderItemDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un item de Orden por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del item de Orden' })
  @ApiResponse({ status: 204, description: 'item de Orden eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el item de Orden a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el item de Orden (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
