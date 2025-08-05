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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RecyclePrice } from './entities/recycle_price.entity';
import { RecyclePricesService } from './recycle_prices.service';
import { CreateRecyclePriceDto } from './dto/create-recycle_price.dto';
import { UpdateRecyclePriceDto } from './dto/update-recycle_price.dto';

@ApiTags('orders')
@Controller('orders')
export class RecyclePricesController {
  constructor(private readonly service: RecyclePricesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar materiales a reciclar con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de materiales a reciclar retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[RecyclePrice[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un material a reciclar por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el material a reciclar' })
  @ApiResponse({ status: 200, description: 'Material a reciclar encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el material a reciclar' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RecyclePrice> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo material a reciclar' })
  @ApiResponse({ status: 201, description: 'Material a reciclar creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el material a reciclar' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el material a reciclar' })
  async create(@Body() body: CreateRecyclePriceDto): Promise<RecyclePrice> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un material a reciclar existente' })
  @ApiParam({ name: 'id', description: 'UUID de el material a reciclar' })
  @ApiResponse({ status: 200, description: 'Material a reciclar actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el material a reciclar a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el material a reciclar' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRecyclePriceDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un material a reciclar por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el material a reciclar' })
  @ApiResponse({ status: 204, description: 'Material a reciclar eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el material a reciclar a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el material a reciclar (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
