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
  BadRequestException,
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
import { PrizeRedemptionsService } from './prize-redemptions.service';
import { PrizeRedemption } from './entities/prize-redemption.entity';
import { CreatePrizeRedemptionDto } from './dto/create-prize-redemption.dto';
import { UpdatePrizeRedemptionDto } from './dto/update-prize-redemption.dto';
import { FlexibleAuthGuard } from 'src/auth/guards/flexible-auth.guard';

@ApiTags('prize-redemptions')
@Controller('prize-redemptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(FlexibleAuthGuard)
export class PrizeRedemptionsController {
  constructor(private readonly service: PrizeRedemptionsService) {}

  @Get()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Listar canjes de premios con paginación y filtro exclusivo' })
@ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
@ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
@ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filtrar por ID de usuario. No usar junto con prize_id.' })
@ApiQuery({ name: 'prize_id', required: false, type: String, description: 'Filtrar por ID de premio. No usar junto con user_id.' })
@ApiResponse({ status: 200, description: 'Listado de canjes de premios retornado correctamente' })
@ApiResponse({ status: 400, description: 'Solo puede enviarse user_id o prize_id, no ambos.' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
  @Query('user_id') user_id = '',
  @Query('prize_id') prize_id = '',
): Promise<[PrizeRedemption[], number]> {
  const hasUserId = user_id.trim() !== '';
  const hasGroupId = prize_id.trim() !== '';
  if (hasUserId && hasGroupId) throw new BadRequestException('Solo puede buscar por usuario o premio pero no ambos al mismo tiempo.');
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  return await this.service.findAll(prize_id, user_id, pageNumber, limitNumber);
}

@Get(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Obtener un canje de premio por su ID' })
@ApiParam({ name: 'id', description: 'UUID del canje de premio' })
@ApiResponse({ status: 200, description: 'Canje de premio encontrado' })
@ApiResponse({ status: 404, description: 'No se encontró el canje de premio' })
@ApiResponse({ status: 500, description: 'Error interno del servidor' })
async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PrizeRedemption> {
  return await this.service.findOne(id);
}

@Post()
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Crear un nuevo canje de premio' })
@ApiResponse({ status: 201, description: 'Canje de premio creado exitosamente' })
@ApiResponse({ status: 400, description: 'Datos inválidos para crear el canje de premio' })
@ApiResponse({ status: 500, description: 'Error al crear el miembro' })
async create(@Body() body: CreatePrizeRedemptionDto): Promise<PrizeRedemption> {
  return await this.service.create(body);
}

@Put(':id')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Actualizar un canje de premio existente' })
@ApiParam({ name: 'id', description: 'UUID del canje de premio a actualizar' })
@ApiResponse({ status: 200, description: 'Canje de premio actualizado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el canje de premio a actualizar' })
@ApiResponse({ status: 500, description: 'Error al actualizar el canje de premio' })
async update(@Param('id', ParseUUIDPipe) id: string, @Body() body: UpdatePrizeRedemptionDto) {
  return this.service.update(id, body);
}

@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Eliminar un canje de premio por su ID' })
@ApiParam({ name: 'id', description: 'UUID del canje de premio a eliminar' })
@ApiResponse({ status: 204, description: 'Canje de premio eliminado correctamente' })
@ApiResponse({ status: 404, description: 'No se encontró el canje de premio a eliminar' })
@ApiResponse({ status: 409, description: 'No se puede eliminar el canje de premio (conflicto)' })
async remove(@Param('id', ParseUUIDPipe) id: string) {
  await this.service.remove(id);
}

}
