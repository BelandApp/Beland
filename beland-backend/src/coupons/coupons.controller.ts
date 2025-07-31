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
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { Coupon } from './entities/coupon.entity';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { CreateCouponDto } from './dto/create-coupon.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly service: CouponsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar cupones con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filtrar cupones por ID de usuario que lo canjeó, si no se envia retorna todos los cupones' })
  @ApiResponse({ status: 200, description: 'Listado de cupones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('user_id') user_id = '',
  ): Promise<[Coupon[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(user_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un cupón por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del cupón' })
  @ApiResponse({ status: 200, description: 'Cupón encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el cupón' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Coupon> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo cupón' })
  @ApiResponse({ status: 201, description: 'Cupón creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el cupón' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el cupón' })
  async create(@Body() body: CreateCouponDto): Promise<Coupon> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un cupón existente' })
  @ApiParam({ name: 'id', description: 'UUID del cupón' })
  @ApiResponse({ status: 200, description: 'Cupón actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el cupón a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el cupón' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCouponDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un cupón por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del cupón' })
  @ApiResponse({ status: 204, description: 'Cupón eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el cupón a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el cupón (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
