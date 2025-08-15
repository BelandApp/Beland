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
import { GroupType } from './entities/group-type.entity';
import { CreateGroupTypeDto } from './dto/create-group-type.dto';
import { UpdateGroupTypeDto } from './dto/update-group-type.dto';
import { GroupTypeService } from './group-type.service';
import { Product } from 'src/products/entities/product.entity';

@ApiTags('group-type')
@Controller('group-type')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class GroupTypeController {
  constructor(private readonly service: GroupTypeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipos de grupos con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de grupos retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[GroupType[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get('products/:groupTypeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos los productos asociados a un tipo de grupo particular' })
  @ApiParam({ name: 'groupTypeId', description: 'UUID de el tipo de grupo' })
  @ApiResponse({ status: 200, description: 'Listado de productos retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async getProductsByGroupType(@Param('groupTypeId', ParseUUIDPipe) groupTypeId: string): Promise<Product[]> {
    return await this.service.getProductsByGroupType(groupTypeId);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un tipo de grupo por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de grupogrupo' })
  @ApiResponse({ status: 200, description: 'Tipo de grupogrupo encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de grupogrupo' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<GroupType> {
    return await this.service.findOne(id);
  }



  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo tipo de grupo' })
  @ApiResponse({ status: 201, description: 'Tipo de grupo creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el tipo de grupo' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el tipo de grupo' })
  async create(@Body() body: CreateGroupTypeDto): Promise<GroupType> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un tipo de grupo existente' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de grupo' })
  @ApiResponse({ status: 200, description: 'Tipo de grupo actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de grupo a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el tipo de grupo' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateGroupTypeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un tipo de grupo por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el tipo de grupo' })
  @ApiResponse({ status: 204, description: 'Tipo de grupo eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el tipo de grupo a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el tipo de grupo (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
