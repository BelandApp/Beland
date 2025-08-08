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
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { CartItem } from './entities/cart-item.entity';
import { CartItemsService } from './cart-items.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@ApiTags('order-items')
@Controller('order-items')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class CartItemsController {
  constructor(private readonly service: CartItemsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar items de Carrito con paginación y filtrado por orden' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'cart_id', required: true, type: String, description: 'Filtrar items de carrito por ID de carrito' })
  @ApiResponse({ status: 200, description: 'Listado de items de carrito retornado correctamente' })
  @ApiResponse({ status: 400, description: 'Debe enviar el identificador del Carrito' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('cart_id') cart_id,
  ): Promise<[CartItem[], number]> {
    if (!cart_id) throw new BadRequestException('Debe enviar el identificador del Carrito');
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(cart_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un item de carrito por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del item de carrito' })
  @ApiResponse({ status: 200, description: 'item de carrito encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el item de carrito' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<CartItem> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo item de carrito' })
  @ApiResponse({ status: 201, description: 'item de carrito creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el item de carrito' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el item de carrito' })
  async create(@Body() body: CreateCartItemDto): Promise<CartItem> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un item de carrito existente' })
  @ApiParam({ name: 'id', description: 'UUID del item de carrito' })
  @ApiResponse({ status: 200, description: 'item de carrito actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el item de carrito a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el item de carrito' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCartItemDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un item de carrito por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del item de carrito' })
  @ApiResponse({ status: 204, description: 'item de carrito eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el item de carrito a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el item de carrito (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
