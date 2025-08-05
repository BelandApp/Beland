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
import { Merchant } from './entities/merchant.entity';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';

@ApiTags('merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly service: MerchantsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar comercios con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filtrar cupones por ID de usuario, si no se envia retorna todos los comercios' })
  @ApiResponse({ status: 200, description: 'Listado de comercios retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('user_id') user_id = '',
  ): Promise<[Merchant[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(user_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un comercio por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del comercio' })
  @ApiResponse({ status: 200, description: 'Comercio encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el comercio' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Merchant> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo comercio' })
  @ApiResponse({ status: 201, description: 'Comercio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el comercio' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el comercio' })
  async create(@Body() body: CreateMerchantDto): Promise<Merchant> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un comercio existente' })
  @ApiParam({ name: 'id', description: 'UUID del comercio' })
  @ApiResponse({ status: 200, description: 'Comercio actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el comercio a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el comercio' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateMerchantDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un comercio por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del comercio' })
  @ApiResponse({ status: 204, description: 'Comercio eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el comercio a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el comercio (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
