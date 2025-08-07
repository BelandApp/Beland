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
import { RecycledItemsService } from './recycled-items.service';
import { RecycledItem } from './entities/recycled-item.entity';
import { CreateRecycledItemDto } from './dto/create-recycled-item.dto';
import { UpdateRecycledItemDto } from './dto/update-recycled-item.dto';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@ApiTags('recycled-items')
@Controller('recycled-items')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class RecycledItemsController {
  constructor(private readonly service: RecycledItemsService) {}

  @Get()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Listar productos reciclados con paginación y filtro exclusivo' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
@ApiQuery({ name: 'product_id', required: false, type: String, description: 'Filtrar por ID de producto. Si no se envia retorna todos los items de reciclado del Usuario.' })
@ApiResponse({ status: 200, description: 'Listado de productos reciclados retornado correctamente' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Req() req : Request,
  @Query('product_id') product_id = '',
): Promise<[RecycledItem[], number]> {
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  return await this.service.findAll(product_id, req.user?.id, pageNumber, limitNumber);
}

@Get(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Obtener un producto reciclado por su ID' })
@ApiParam({ name: 'id', description: 'UUID del producto reciclado' })
@ApiResponse({ status: 200, description: 'Producto reciclado encontrado' })
@ApiResponse({ status: 404, description: 'No se encontró el producto reciclado' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<RecycledItem> {
  return await this.service.findOne(id);
}

@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Crear un nuevo producto reciclado' })
@ApiResponse({ status: 201, description: 'Producto reciclado creado exitosamente' })
@ApiResponse({ status: 400, description: 'Datos inválidos para crear el producto reciclado' })
@ApiResponse({ status: 500, description: 'Error al crear el miembro' })
async create(@Body() body: CreateRecycledItemDto): Promise<RecycledItem> {
  return await this.service.create(body);
}

@Put(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Actualizar un producto reciclado existente' })
@ApiParam({ name: 'id', description: 'UUID del producto reciclado a actualizar' })
@ApiResponse({ status: 200, description: 'Producto reciclado actualizado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el producto reciclado a actualizar' })
@ApiResponse({ status: 500, description: 'Error al actualizar el producto reciclado' })
async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdateRecycledItemDto) {
  return this.service.update(id, body);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Eliminar un producto reciclado por su ID' })
@ApiParam({ name: 'id', description: 'UUID del producto reciclado a eliminar' })
@ApiResponse({ status: 204, description: 'Producto reciclado eliminado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el producto reciclado a eliminar' })
@ApiResponse({ status: 409, description: 'No se puede eliminar el producto reciclado (conflicto)' })
async remove(@Param('id', ParseUUIDPipe) id: string) {
  await this.service.remove(id);
}

}
