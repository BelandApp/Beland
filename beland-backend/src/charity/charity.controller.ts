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
import { Charity } from './entities/charity.entity';
import { CharitiesService } from './charity.service';
import { CreateCharityDto } from './dto/create-charity.dto';
import { UpdateCharityDto } from './dto/update-charity.dto';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';

@ApiTags('charities')
@Controller('charities')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class CharitiesController {
  constructor(private readonly service: CharitiesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar fundaciones con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de fundaciones retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[Charity[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una fundación por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la fundación' })
  @ApiResponse({ status: 200, description: 'Fundación encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró la fundación' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Charity> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva fundación' })
  @ApiResponse({ status: 201, description: 'Fundación creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la fundación' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la fundación' })
  async create(@Body() body: CreateCharityDto): Promise<Charity> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una fundación existente' })
  @ApiParam({ name: 'id', description: 'UUID de la fundación' })
  @ApiResponse({ status: 200, description: 'Fundación actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la fundación a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la fundación' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateCharityDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una fundación por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la fundación' })
  @ApiResponse({ status: 204, description: 'Fundación eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la fundación a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la fundación (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
