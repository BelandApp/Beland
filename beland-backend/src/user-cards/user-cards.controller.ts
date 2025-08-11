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
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { UserCard } from './entities/user-card.entity';
import { UserCardsService } from './user-cards.service';
import { CreateUserCardDto } from './dto/create-user-card.dto';
import { UpdateUserCardDto } from './dto/update-user-card.dto';

@ApiTags('user-cards')
@Controller('user-cards')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class UserCardsController {
  constructor(private readonly service: UserCardsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tarjetas con paginación y filtrado por usuario' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de tarjetas retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Req() req: Request,
  ): Promise<[UserCard[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(req.user?.id, pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener una tarjeta por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la tarjeta' })
  @ApiResponse({ status: 200, description: 'Tarjeta encontrada' })
  @ApiResponse({ status: 404, description: 'No se encontró la tarjeta' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserCard> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva tarjeta' })
  @ApiResponse({ status: 201, description: 'Tarjeta creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear la tarjeta' })
  @ApiResponse({ status: 500, description: 'No se pudo crear la tarjeta' })
  async create(@Body() body: CreateUserCardDto): Promise<UserCard> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar una tarjeta existente' })
  @ApiParam({ name: 'id', description: 'UUID de la tarjeta' })
  @ApiResponse({ status: 200, description: 'Tarjeta actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la tarjeta a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar la tarjeta' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserCardDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarjeta por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de la tarjeta' })
  @ApiResponse({ status: 204, description: 'Tarjeta eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró la tarjeta a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar la tarjeta (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
