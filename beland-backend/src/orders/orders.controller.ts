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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { Cart } from 'src/cart/entities/cart.entity';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class OrdersController {
  constructor(private readonly service: OrdersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar ordenes con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de ordenes retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req : Request,
  ): Promise<[Order[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una orden por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la orden' })
  @ApiResponse({ status: 200, description: 'Orden encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la orden' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva orden' })
  @ApiResponse({ status: 201, description: 'Orden creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la orden' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la orden' })
  async create(@Body() body: CreateOrderDto): Promise<Order> {
    return await this.service.create(body);
  }

  @Post('cart')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva orden desde un carrito' })
  @ApiResponse({ status: 201, description: 'Orden creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la orden' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la orden' })
  async createByCart(@Body() body: Cart): Promise<Order> {
    const order = {
      total_amount: body.total_amount,
      total_items: body.total_items,
      leader_id: body.user_id,
    }

    return await this.service.create(order);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una orden existente' })
  @ApiParam({ name: 'id', description: 'UUID de la orden' })
  @ApiResponse({ status: 200, description: 'Orden actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la orden a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la orden' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateOrderDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una orden por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la orden' })
  @ApiResponse({ status: 204, description: 'Orden eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la orden a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la orden (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
