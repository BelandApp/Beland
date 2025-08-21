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
import { ResourcesType } from './entities/resources-type.entity';
import { ResourcesTypesService } from './resources-types.service';
import { CreateResourcesTypeDto } from './dto/create-resources-type.dto';
import { UpdateResourcesTypeDto } from './dto/update-resources-type.dto';

@ApiTags('resource-type')
@Controller('resource-type')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class ResourcesTypesController {
  constructor(private readonly service: ResourcesTypesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipos de recursos con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de tipos de recursos retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[ResourcesType[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de recurso por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de recurso' })
  @ApiResponse({ status: 200, description: 'Tipo de recurso encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de recurso' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResourcesType> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de recurso' })
  @ApiResponse({ status: 201, description: 'Tipo de recurso creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el tipo de recurso' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el tipo de recurso' })
  async create(@Body() body: CreateResourcesTypeDto): Promise<ResourcesType> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de recurso existente' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de recurso' })
  @ApiResponse({ status: 200, description: 'Tipo de recurso actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de recurso a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el tipo de recurso' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateResourcesTypeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de recurso por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de recurso' })
  @ApiResponse({ status: 204, description: 'Tipo de recurso eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de recurso a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el tipo de recurso (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}

