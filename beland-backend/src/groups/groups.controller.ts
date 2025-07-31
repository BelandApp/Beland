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
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar grupos con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filtrar grupos por ID de usuario creador, si no se envia retorna todos los grupos' })
  @ApiResponse({ status: 200, description: 'Listado de grupos retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('user_id') user_id = '',
  ): Promise<[Group[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(user_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un grupo por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del grupo' })
  @ApiResponse({ status: 200, description: 'grupo encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el grupo' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Group> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo grupo' })
  @ApiResponse({ status: 201, description: 'grupo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el grupo' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el grupo' })
  async create(@Body() body: CreateGroupDto): Promise<Group> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un grupo existente' })
  @ApiParam({ name: 'id', description: 'UUID del grupo' })
  @ApiResponse({ status: 200, description: 'grupo actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el grupo a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el grupo' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGroupDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un grupo por su ID' })
  @ApiParam({ name: 'id', description: 'UUID del grupo' })
  @ApiResponse({ status: 204, description: 'grupo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el grupo a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el grupo (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.service.remove(id);
  }
}
