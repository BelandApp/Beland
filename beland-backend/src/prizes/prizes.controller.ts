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
import { PrizesService } from './prizes.service';
import { Prize } from './entities/prize.entity';
import { CreatePrizeDto } from './dto/create-prize.dto';
import { UpdatePrizeDto } from './dto/update-prize.dto';
import { AuthenticationGuard } from 'src/auth/guards/auth.guard';

@ApiTags('orders')
@Controller('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthenticationGuard)
export class PrizesController {
  constructor(private readonly service: PrizesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar premios con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Cantidad de elementos por página' })
  @ApiResponse({ status: 200, description: 'Listado de premios retornado correctamente' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<[Prize[], number]> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.service.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener un premio por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el premio' })
  @ApiResponse({ status: 200, description: 'Premio encontrado' })
  @ApiResponse({ status: 404, description: 'No se encontró el premio' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Prize> {
    return await this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo premio' })
  @ApiResponse({ status: 201, description: 'Premio creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos para crear el premio' })
  @ApiResponse({ status: 500, description: 'No se pudo crear el premio' })
  async create(@Body() body: CreatePrizeDto): Promise<Prize> {
    return await this.service.create(body);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar un premio existente' })
  @ApiParam({ name: 'id', description: 'UUID de el premio' })
  @ApiResponse({ status: 200, description: 'Premio actualizado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el premio a actualizar' })
  @ApiResponse({ status: 500, description: 'Error al actualizar el premio' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdatePrizeDto,
  ) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un premio por su ID' })
  @ApiParam({ name: 'id', description: 'UUID de el premio' })
  @ApiResponse({ status: 204, description: 'Premio eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'No se encontró el premio a eliminar' })
  @ApiResponse({ status: 409, description: 'No se puede eliminar el premio (conflicto)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
  }
}
