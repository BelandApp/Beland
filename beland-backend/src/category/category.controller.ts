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
import { Request } from 'express';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';
import { Category } from './entities/category.entity';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('category')
@Controller('category')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar categorias con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de categorias retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[Category[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una categoria por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la categoria' })
  @ApiResponse({ status: 200, description: 'Categoria encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la categoria' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Category> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva categoria' })
  @ApiResponse({ status: 201, description: 'Categoria creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la categoria' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la categoria' })
  async create(@Body() body: CreateCategoryDto): Promise<Category> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una categoria existente' })
  @ApiParam({ name: 'id', description: 'UUID de la categoria' })
  @ApiResponse({ status: 200, description: 'Categoria actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la categoria a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la categoria' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una categoria por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la categoria' })
  @ApiResponse({ status: 204, description: 'Categoria eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la categoria a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la categoria (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
