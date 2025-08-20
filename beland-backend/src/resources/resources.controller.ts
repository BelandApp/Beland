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
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { Resource } from './entities/resource.entity';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@ApiTags('resources')
@Controller('resources')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class ResourcesController {
  constructor(private readonly service: ResourcesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar recursos con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiQuery({ name: 'resource_type_id', required: false, type: String, description: 'Filtrar por ID del tipo de recurso. (opcional)' })  
  @ApiResponse({ status: 200, description: 'Listado de recursos retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('resource_type_id') resource_type_id = '',
  ): Promise<[Resource[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(resource_type_id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un recurso por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el recurso' })
  @ApiResponse({ status: 200, description: 'Recurso encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Resource> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo recurso' })
  @ApiResponse({ status: 201, description: 'Recurso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el recurso' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el recurso' })
  async create(@Body() body: CreateResourceDto): Promise<Resource> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un recurso existente' })
  @ApiParam({ name: 'id', description: 'UUID de el recurso' })
  @ApiResponse({ status: 200, description: 'Recurso actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el recurso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateResourceDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un recurso por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el recurso' })
  @ApiResponse({ status: 204, description: 'Recurso eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el recurso a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el recurso (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
