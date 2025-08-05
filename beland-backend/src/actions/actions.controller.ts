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
import { Action } from './entities/action.entity';
import { ActionsService } from './actions.service';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';

@ApiTags('actions')
@Controller('actions')
export class ActionsController {
  constructor(private readonly service: ActionsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar acciónes con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filtrar acciónes por ID de usuario, si no se envia retorna todas las acciónes' })
  @ApiResponse({ status: 200, description: 'Listado de acciónes retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('user_id') user_id = '',
  ): Promise<[Action[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(user_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una acción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la acción' })
  @ApiResponse({ status: 200, description: 'Acción encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la acción' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Action> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva acción' })
  @ApiResponse({ status: 201, description: 'Acción creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la acción' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la acción' })
  async create(@Body() body: CreateActionDto): Promise<Action> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una acción existente' })
  @ApiParam({ name: 'id', description: 'UUID de la acción' })
  @ApiResponse({ status: 200, description: 'Acción actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la acción a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la acción' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateActionDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una acción por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la acción' })
  @ApiResponse({ status: 204, description: 'Acción eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la acción a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la acción (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
